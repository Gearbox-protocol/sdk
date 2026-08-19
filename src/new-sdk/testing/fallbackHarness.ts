import type { Mock, MockInstance } from "vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { DataResponse } from "../../model/index.js";
import { GearboxAPI } from "../../offchain/index.js";
import { AllSourcesFailedError } from "../errors/index.js";
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
  makeNamespace: (onchainStub: OnchainStub, api: GearboxAPI) => NS;
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

    beforeEach(() => {
      fetchMock = vi.spyOn(globalThis, "fetch");
      onchainStub = createOnchainStub(opts.cases);
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
      );
    }

    for (const methodCase of opts.cases.filter(isMerged)) {
      describe(methodCase.method, () => {
        for (const scenario of TRANSPORT_FAILURES) {
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

        it("control: serves fresh offchain data when the backend is healthy", async () => {
          fetchMock.mockResolvedValue(jsonResponse(methodCase.offchainPayload));
          stubOnchain(onchainStub, methodCase).mockResolvedValue(
            methodCase.onchainResponse,
          );

          const result = await methodCase.invoke(namespace());

          expect(fetchMock).toHaveBeenCalled();
          expect(
            result.meta.chains.every(chain => chain.source === "offchain"),
          ).toBe(true);
        });
      });
    }

    for (const methodCase of opts.cases.filter(isOffchainOnly)) {
      describe(methodCase.method, () => {
        for (const scenario of TRANSPORT_FAILURES) {
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
