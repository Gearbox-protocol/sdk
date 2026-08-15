import type {
  ChainId,
  ChainMetadata,
  DataResponse,
  DataSource,
  ResponseMetadata,
} from "../model/index.js";
import type { ILogger } from "../sdk/types/logger.js";
import type { SourceMerger } from "./merge/index.js";
import { noSourceServed } from "./merge/index.js";
import type { NamespaceOptions } from "./types.js";
import { AllSourcesFailedError } from "./types.js";

/**
 * One read of a combined namespace, expressed once per source plus the policy
 * that turns the two answers into one.
 *
 * @typeParam Onchain - On-chain source namespace.
 * @typeParam Offchain - Backend source namespace.
 * @typeParam T - Payload type of the read.
 **/
export interface MergedQuery<Onchain, Offchain, T> {
  /**
   * The read, against the chain.
   **/
  fromChain(source: Onchain): Promise<DataResponse<T>>;
  /**
   * The same read, against the backend.
   **/
  fromBackend(source: Offchain): Promise<DataResponse<T>>;
  /**
   * How the two answers become one, see {@link SourceMerger}.
   **/
  merge: SourceMerger<T>;
  /**
   * Chains the read narrows itself to, if it narrows at all. Each source scopes
   * its own request, so this is only what a total failure is reported over,
   * intersected with the chains the namespace covers.
   **/
  scope?: ChainId[];
}

/**
 * What one source contributed, after a rejection has been caught.
 **/
interface SourceOutcome<T> {
  /**
   * Envelope the source answered with. Absent when it was not asked, or was
   * asked and threw.
   **/
  response?: DataResponse<T>;
  /**
   * Why the read threw, when it did.
   **/
  error?: unknown;
}

/**
 * Shared machinery of every {@link GearboxSDK} namespace.
 *
 * A namespace is a stateless router over two source namespaces. It exposes each
 * of them directly, so a consumer can read them one at a time and merge later,
 * and it runs both at once for the merged reads. Merging itself is a pure
 * function the subclass names, see {@link SourceMerger}.
 *
 * The sources are whatever it was handed, and their readiness is their owner's
 * business: a source that is not ready to answer fails the read it was given,
 * and that failure is reported like any other.
 *
 * All protocol knowledge lives in the sources. None of it is repeated here or
 * in a subclass.
 *
 * @typeParam Onchain - On-chain source namespace, e.g.
 *   `MultichainOpportunitiesService`.
 * @typeParam Offchain - Backend source namespace, e.g. `OffchainOpportunities`.
 **/
export abstract class AbstractNamespace<Onchain, Offchain> {
  /**
   * How far the backend may lag the chain, for the mergers a subclass names.
   **/
  protected readonly maxOffchainLagSeconds: number;
  protected readonly logger?: ILogger;

  readonly #chainIds: ChainId[];
  readonly #onchain?: Onchain;
  readonly #offchain?: Offchain;

  protected constructor(
    name: string,
    onchain: Onchain | undefined,
    offchain: Offchain | undefined,
    options: NamespaceOptions,
  ) {
    this.#onchain = onchain;
    this.#offchain = offchain;
    this.#chainIds = [...options.chainIds];
    this.maxOffchainLagSeconds = options.maxOffchainLagSeconds;
    this.logger = options.logger?.child?.({ name }) ?? options.logger;
  }

  /**
   * This namespace on the chain alone, unmerged and unfiltered.
   *
   * The same instance as `sdk.onchain.<namespace>`, so the two spellings cannot
   * drift apart. `undefined` in `offchain` mode, where the type of the facade
   * does not offer it.
   **/
  public get onchain(): Onchain {
    return this.#onchain as Onchain;
  }

  /**
   * This namespace on the backend alone, unmerged.
   *
   * The same instance as `sdk.offchain.<namespace>`. `undefined` in `onchain`
   * mode, where the type of the facade does not offer it.
   **/
  public get offchain(): Offchain {
    return this.#offchain as Offchain;
  }

  /**
   * Asks both sources at once and merges what came back.
   *
   * A source that throws is logged and dropped, so one dead source degrades a
   * `both`-mode read rather than failing it. The read only fails when nothing
   * usable is left: every chain it covers errored, or neither source produced
   * anything at all.
   *
   * The action name is used in diagnostics and in that error.
   **/
  protected async merged<T>(
    action: string,
    query: MergedQuery<Onchain, Offchain, T>,
  ): Promise<DataResponse<T>> {
    const onchain = this.#onchain;
    const offchain = this.#offchain;
    const [fromChain, fromBackend] = await Promise.all([
      this.#ask(action, "onchain", onchain && (() => query.fromChain(onchain))),
      this.#ask(
        action,
        "offchain",
        offchain && (() => query.fromBackend(offchain)),
      ),
    ]);

    const merged = query.merge(fromChain.response, fromBackend.response);
    if (!merged) {
      // with one source there is nothing to have chosen between, so its own
      // error is the answer rather than a wrapper saying every source failed
      const sole = soleFailure(fromChain, fromBackend);
      if (sole !== undefined) {
        throw sole;
      }
      // a source that threw said nothing about any chain, so the failure is
      // reported over the chains the read covered: the namespace's own, as far
      // as the read narrowed them
      const { scope } = query;
      const covered = scope
        ? this.#chainIds.filter(chainId => scope.includes(chainId))
        : this.#chainIds;
      throw new AllSourcesFailedError(
        action,
        failureMeta(covered, fromChain, fromBackend),
      );
    }
    if (
      merged.meta.chains.length > 0 &&
      merged.meta.chains.every(chain => chain.status === "error")
    ) {
      throw new AllSourcesFailedError(action, merged.meta);
    }

    this.#logDiscarded(merged, fromChain, fromBackend);
    return merged;
  }

  /**
   * Runs one source's leg of a read, turning a rejection into an outcome so
   * that the other source is still merged.
   **/
  async #ask<T>(
    action: string,
    source: DataSource,
    run: (() => Promise<DataResponse<T>>) | undefined,
  ): Promise<SourceOutcome<T>> {
    if (!run) {
      return {};
    }
    try {
      return { response: await run() };
    } catch (error) {
      this.logger?.warn(error, `failed to ${action} from the ${source} source`);
      return { error };
    }
  }

  /**
   * Records which source lost each chain.
   *
   * Only logged, never put in the envelope: to a screen, a backend that failed
   * and a backend that was too far behind mean the same thing, and the envelope
   * says which source it is showing.
   **/
  #logDiscarded<T>(
    merged: DataResponse<T>,
    fromChain: SourceOutcome<T>,
    fromBackend: SourceOutcome<T>,
  ): void {
    if (!this.logger?.debug || !fromChain.response || !fromBackend.response) {
      return;
    }
    for (const chain of merged.meta.chains) {
      if (chain.status !== "success") {
        continue;
      }
      const loser = chain.source === "onchain" ? fromBackend : fromChain;
      const discarded = loser.response?.meta.chains.find(
        other => other.chainId === chain.chainId,
      );
      if (!discarded) {
        continue;
      }
      this.logger.debug(
        `chain ${chain.chainId} served from the ${chain.source} source, ` +
          `${describeDiscarded(discarded, chain.timestamp)}`,
      );
    }
  }
}

/**
 * The rejection of the only source that was asked, when there was just one.
 *
 * A source that was not asked contributes neither a response nor an error, which
 * is what distinguishes a single-source mode from both sources failing.
 **/
function soleFailure(
  fromChain: SourceOutcome<unknown>,
  fromBackend: SourceOutcome<unknown>,
): unknown {
  const asked = [fromChain, fromBackend].filter(
    outcome => outcome.response !== undefined || outcome.error !== undefined,
  );
  return asked.length === 1 ? asked[0]?.error : undefined;
}

/**
 * Outcome of every chain a failed read covered, keeping the reason a source
 * did give for a chain over the reason its whole leg threw.
 **/
function failureMeta(
  chainIds: readonly ChainId[],
  fromChain: SourceOutcome<unknown>,
  fromBackend: SourceOutcome<unknown>,
): ResponseMetadata {
  const legReasons = [fromChain.error, fromBackend.error].filter(
    reason => reason !== undefined,
  );
  const chains = chainIds.map(chainId => {
    const reported = [fromChain.response, fromBackend.response]
      .flatMap(response => response?.meta.chains ?? [])
      .filter(chain => chain.chainId === chainId)
      .map(chain => (chain.status === "error" ? chain.error : undefined));
    const reasons = [...reported, ...legReasons].filter(
      reason => reason !== undefined,
    );
    return noSourceServed(chainId, reasons);
  });
  return { chains };
}

/**
 * Why the source that lost a chain lost it.
 **/
function describeDiscarded(
  discarded: ChainMetadata,
  servedAt: number | undefined,
): string {
  if (discarded.status === "error") {
    return `the ${discarded.source ?? "other"} source failed it: ${discarded.error}`;
  }
  if (servedAt === undefined || discarded.timestamp === undefined) {
    return `the ${discarded.source} source did not say how fresh its answer was`;
  }
  return `the ${discarded.source} source was ${servedAt - discarded.timestamp}s behind`;
}
