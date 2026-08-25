import type { Mock, MockInstance } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { ChainId, DataResponse } from "../../model/index.js";
import { GearboxAPI } from "../../offchain/index.js";
import { AllSourcesFailedError } from "../errors/index.js";
import type { EnsureFreshChains, NamespaceOptions } from "../types.js";
import {
  DEGRADED_RESPONSES,
  jsonResponse,
  OFFCHAIN_TIMEOUT_MS,
  TEST_CHAIN_A,
  TEST_CHAIN_B,
  TRANSPORT_FAILURES,
} from "./offchainFailures.js";

/**
 * On-chain source stand-in: one `vi.fn` per registered method.
 **/
export type OnchainStub = Record<string, Mock>;

/**
 * A merged read: both sources are asked, and a failing backend must not fail
 * the call.
 **/
export interface MergedFallbackCase<NS> {
  method: keyof NS & string;
  kind: "merged";
  invoke: (ns: NS) => Promise<DataResponse<unknown>>;
  onchainResponse: DataResponse<unknown>;
  offchainPayload: unknown;
  /**
   * Chains the on-chain leg names to the loading policy. Omitted when the
   * read fans out to every chain.
   **/
  expectedChainIds?: readonly ChainId[];
}

/**
 * A backend-only read: there is nothing to fall back to, so each transport
 * failure must surface as its typed error.
 **/
export interface OffchainOnlyFallbackCase<NS> {
  method: keyof NS & string;
  kind: "offchainOnly";
  invoke: (ns: NS) => Promise<DataResponse<unknown>>;
}

/**
 * One method the harness stamps a scenario matrix for.
 **/
export type FallbackMethodCase<NS> =
  | MergedFallbackCase<NS>
  | OffchainOnlyFallbackCase<NS>;

/**
 * How a namespace test file connects the harness.
 **/
export interface DescribeFallbackOptions<NS> {
  makeNamespace: (
    onchainStub: OnchainStub,
    api: GearboxAPI,
    options: NamespaceOptions,
  ) => NS;
  cases: FallbackMethodCase<NS>[];
}

/**
 * Stamps the methods-by-scenarios matrix for one namespace in `both` mode.
 * The offchain client is real; only `fetch` and the on-chain source are faked.
 **/
export function describeOffchainFallback<NS>(
  opts: DescribeFallbackOptions<NS>,
): void {
  describe("offchain fallback in both mode", () => {
    let fetchMock: MockInstance<typeof fetch>;
    let onchainStub: OnchainStub;
    let ensureFresh: Mock<EnsureFreshChains>;

    beforeEach(() => {
      fetchMock = vi.spyOn(globalThis, "fetch");
      onchainStub = createOnchainStub(opts.cases);
      ensureFresh = vi.fn<EnsureFreshChains>().mockResolvedValue(undefined);
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    function namespace(): NS {
      return opts.makeNamespace(
        onchainStub,
        new GearboxAPI({
          baseUrl: "https://api.gearbox.fi",
          chainIds: [TEST_CHAIN_A, TEST_CHAIN_B],
          timeout: OFFCHAIN_TIMEOUT_MS,
        }),
        { maxOffchainLagSeconds: 120, ensureFresh },
      );
    }

    for (const methodCase of opts.cases.filter(isMerged)) {
      describe(methodCase.method, () => {
        for (const scenario of TRANSPORT_FAILURES) {
          /**
           * The whole offchain leg throws (network, timeout, 4xx/5xx, bad
           * JSON, schema mismatch), so every chain must come from the
           * on-chain stub. The fetch spy is checked so a skipped backend
           * call cannot pass as a "fallback".
           **/
          it(`falls back to onchain when ${scenario.name}`, async () => {
            fetchMock.mockImplementation(scenario.fetchImpl);
            stubOnchain(onchainStub, methodCase).mockResolvedValue(
              methodCase.onchainResponse,
            );

            const result = await methodCase.invoke(namespace());

            expect(fetchMock).toHaveBeenCalled();
            expect(result.data).toEqual(methodCase.onchainResponse.data);
            for (const chain of result.meta.chains) {
              expect(chain.source).toBe("onchain");
            }
          });

          /**
           * Same transport failure, but the chain is down too. There is
           * nothing to merge; the read must fail rather than return an
           * empty envelope that looks like success.
           **/
          it(`throws AllSourcesFailedError when ${scenario.name} and onchain also fails`, async () => {
            fetchMock.mockImplementation(scenario.fetchImpl);
            stubOnchain(onchainStub, methodCase).mockRejectedValue(
              new Error("rpc down"),
            );

            await expect(methodCase.invoke(namespace())).rejects.toBeInstanceOf(
              AllSourcesFailedError,
            );
          });
        }

        for (const scenario of DEGRADED_RESPONSES) {
          /**
           * HTTP 200 with a usable envelope, but the merge must not take
           * every chain from it: one chain is marked failed, or the
           * timestamps are older than the lag budget. Each scenario names
           * its own per-chain winner.
           **/
          it(`merges per chain when ${scenario.name}`, async () => {
            fetchMock.mockResolvedValue(
              jsonResponse(scenario.makeBody(methodCase.offchainPayload)),
            );
            stubOnchain(onchainStub, methodCase).mockResolvedValue(
              methodCase.onchainResponse,
            );

            const result = await methodCase.invoke(namespace());

            expect(fetchMock).toHaveBeenCalled();
            for (const chain of result.meta.chains) {
              expect(chain.source).toBe(
                scenario.expectedSources[chain.chainId],
              );
            }
          });
        }

        /**
         * Healthy backend and a fresh envelope: offchain must win, or the
         * fallback cases above could pass only because offchain can never
         * win. Also checks that attach/revalidate runs once, for the
         * chains the read names, before the on-chain stub is asked.
         **/
        it("control: serves fresh offchain data when the backend is healthy", async () => {
          fetchMock.mockResolvedValue(jsonResponse(methodCase.offchainPayload));
          const onchain = stubOnchain(
            onchainStub,
            methodCase,
          ).mockResolvedValue(methodCase.onchainResponse);

          const result = await methodCase.invoke(namespace());

          expect(fetchMock).toHaveBeenCalled();
          expect(
            result.meta.chains.every(chain => chain.source === "offchain"),
          ).toBe(true);
          expect(ensureFresh).toHaveBeenCalledOnce();
          expect(ensureFresh).toHaveBeenCalledWith(methodCase.expectedChainIds);
          expect(onchain).toHaveBeenCalledOnce();
          const policyOrder = ensureFresh.mock.invocationCallOrder[0];
          const onchainOrder = onchain.mock.invocationCallOrder[0];
          expect(policyOrder).toBeDefined();
          expect(onchainOrder).toBeDefined();
          if (policyOrder === undefined || onchainOrder === undefined) {
            return;
          }
          expect(policyOrder).toBeLessThan(onchainOrder);
        });

        /**
         * Attach is the only step of the loading path that rejects (a
         * failed sync is swallowed). The on-chain leg then fails, and a
         * healthy backend must still serve every chain.
         **/
        it("falls back to offchain when attach fails", async () => {
          ensureFresh.mockRejectedValue(new Error("attach failed"));
          fetchMock.mockResolvedValue(jsonResponse(methodCase.offchainPayload));

          const result = await methodCase.invoke(namespace());

          expect(
            result.meta.chains.every(chain => chain.source === "offchain"),
          ).toBe(true);
        });

        /**
         * Attach fails and the backend never becomes a response either.
         * Same both-failed contract as the transport axis: the attach
         * error must be one of the causes on AllSourcesFailedError.
         **/
        it("throws AllSourcesFailedError when attach fails and the backend also fails", async () => {
          const attachError = new Error("attach failed");
          ensureFresh.mockRejectedValue(attachError);
          fetchMock.mockImplementation(TRANSPORT_FAILURES[0].fetchImpl);

          const error = await methodCase.invoke(namespace()).then(
            () => {
              throw new Error("expected AllSourcesFailedError");
            },
            reason => reason,
          );

          expect(error).toBeInstanceOf(AllSourcesFailedError);
          expect((error as AllSourcesFailedError).errors).toContain(
            attachError,
          );
        });
      });
    }

    for (const methodCase of opts.cases.filter(isOffchainOnly)) {
      describe(methodCase.method, () => {
        for (const scenario of TRANSPORT_FAILURES) {
          /**
           * Charts and other backend-only reads have no on-chain fallback.
           * Each transport failure must surface as its own typed error,
           * not as AllSourcesFailedError or a silent empty answer.
           **/
          it(`propagates typed error when ${scenario.name}`, async () => {
            fetchMock.mockImplementation(scenario.fetchImpl);

            await expect(methodCase.invoke(namespace())).rejects.toBeInstanceOf(
              scenario.expectedError,
            );
            expect(fetchMock).toHaveBeenCalled();
          });
        }
      });
    }
  });
}

function isMerged<NS>(
  methodCase: FallbackMethodCase<NS>,
): methodCase is MergedFallbackCase<NS> {
  return methodCase.kind === "merged";
}

function isOffchainOnly<NS>(
  methodCase: FallbackMethodCase<NS>,
): methodCase is OffchainOnlyFallbackCase<NS> {
  return methodCase.kind === "offchainOnly";
}

function createOnchainStub<NS>(cases: FallbackMethodCase<NS>[]): OnchainStub {
  const stub: OnchainStub = {};
  for (const methodCase of cases) {
    stub[methodCase.method] = vi.fn();
  }
  return stub;
}

function stubOnchain<NS>(
  onchainStub: OnchainStub,
  methodCase: MergedFallbackCase<NS>,
): Mock {
  const stub = onchainStub[methodCase.method];
  if (stub === undefined) {
    throw new Error(`onchain stub is missing ${methodCase.method}`);
  }
  return stub;
}
