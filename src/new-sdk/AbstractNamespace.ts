import type { ChainId, DataResponse, DataSource } from "../model/index.js";
import type { ILogger } from "../sdk/types/logger.js";
import {
  AllSourcesFailedError,
  everyChainFailed,
  SourceUnavailableError,
} from "./errors/index.js";
import type { EnsureFreshChains, NamespaceOptions } from "./types.js";
import type { EntityMerger, ListMerger } from "./utils/index.js";

/**
 * One read of a combined namespace: the same query against each source, plus
 * the policy that turns the two answers into one.
 *
 * @typeParam Onchain - On-chain source namespace.
 * @typeParam Offchain - Backend source namespace.
 * @typeParam T - Payload type of the read.
 **/
export interface MergedQuery<Onchain, Offchain, T> {
  fromChain: (source: Onchain) => Promise<DataResponse<T>>;
  fromBackend: (source: Offchain) => Promise<DataResponse<T>>;
  merge: ListMerger<T> | EntityMerger<T>;
  /**
   * Chains the on-chain leg touches, so only they are revalidated before it;
   * omitted when the read fans out to every chain.
   **/
  chainIds?: readonly ChainId[];
}

/**
 * What one source contributed, after a rejection has been caught. Both fields
 * are absent when the source was not asked at all.
 **/
interface SourceOutcome<T> {
  response?: DataResponse<T>;
  error?: unknown;
}

/**
 * Base class of every {@link GearboxSDK} namespace: holds the two source
 * namespaces, exposes each on its own, and runs merged reads over both.
 *
 * @typeParam Onchain - On-chain source namespace, e.g.
 *   `MultichainOpportunitiesService`.
 * @typeParam Offchain - Backend source namespace, e.g. `OffchainOpportunities`.
 **/
export abstract class AbstractNamespace<Onchain, Offchain> {
  /**
   * How far the backend may lag the chain and still serve a chain.
   **/
  protected readonly maxOffchainLagSeconds: number;
  protected readonly logger?: ILogger;
  /**
   * The SDK's loading policy, awaited before every on-chain leg: attached, and
   * the touched chains no older than the SDK allows.
   **/
  protected readonly ensureFresh?: EnsureFreshChains;

  readonly #name: string;
  readonly #onchain?: Onchain;
  readonly #offchain?: Offchain;
  /** {@link onchain}, built once: the source's methods behind the loading policy. */
  readonly #onchainView?: Onchain;

  protected constructor(
    name: string,
    onchain: Onchain | undefined,
    offchain: Offchain | undefined,
    options: NamespaceOptions,
  ) {
    this.#name = name;
    this.#onchain = onchain;
    this.#offchain = offchain;
    this.maxOffchainLagSeconds = options.maxOffchainLagSeconds;
    this.ensureFresh = options.ensureFresh;
    this.logger = options.logger?.child?.({ name }) ?? options.logger;
    this.#onchainView =
      onchain && options.ensureFresh
        ? behindLoadingPolicy(onchain, options.ensureFresh)
        : onchain;
  }

  /**
   * The on-chain source namespace on its own — every read of it attaches and
   * revalidates like a merged read does, so a consumer showing the two sources
   * separately still gets the SDK's loading policy. Throws
   * {@link SourceUnavailableError} in `offchain` mode.
   **/
  public get onchain(): Onchain {
    if (!this.#onchainView) {
      throw new SourceUnavailableError(this.#name, "onchain");
    }
    return this.#onchainView;
  }

  /**
   * The backend source namespace on its own. Throws
   * {@link SourceUnavailableError} in `onchain` mode.
   **/
  public get offchain(): Offchain {
    if (!this.#offchain) {
      throw new SourceUnavailableError(this.#name, "offchain");
    }
    return this.#offchain;
  }

  /**
   * Asks both sources at once and merges what came back, failing only when no
   * chain was served at all.
   **/
  protected async merged<T>(
    action: string,
    query: MergedQuery<Onchain, Offchain, T>,
  ): Promise<DataResponse<T>> {
    const onchain = this.#onchain;
    const offchain = this.#offchain;
    const [fromChain, fromBackend] = await Promise.all([
      this.#ask(action, "onchain", onchain, async source => {
        // attach on first read, revalidate by age — the SDK's, not the
        // namespace's, so every namespace shares one attach and one sync
        await this.ensureFresh?.(query.chainIds);
        return query.fromChain(source);
      }),
      this.#ask(action, "offchain", offchain, query.fromBackend),
    ]);

    const merged = query.merge(fromChain.response, fromBackend.response);
    if (merged && !everyChainFailed(merged.meta)) {
      return merged;
    }
    // with one source there is nothing to have chosen between, so its own error
    // is the answer rather than a wrapper saying every source failed
    const sole =
      onchain && offchain ? undefined : (fromChain.error ?? fromBackend.error);
    if (sole !== undefined) {
      throw sole;
    }
    throw new AllSourcesFailedError(
      action,
      [fromChain.error, fromBackend.error],
      merged?.meta,
    );
  }

  /**
   * Runs one source's leg of a read, skipping a source this mode does not have
   * and turning a rejection into an outcome.
   **/
  async #ask<S, T>(
    action: string,
    label: DataSource,
    source: S | undefined,
    run: (source: S) => Promise<DataResponse<T>>,
  ): Promise<SourceOutcome<T>> {
    if (source === undefined) {
      return {};
    }
    try {
      return { response: await run(source) };
    } catch (error) {
      this.logger?.warn(error, `failed to ${action} from the ${label} source`);
      return { error };
    }
  }
}

/**
 * The source's every method, awaiting the loading policy first. The policy is
 * asked for every chain — an escape hatch does not tell which chains a call
 * touches (the merged reads do, and scope it); the object identity differs
 * from the source's, its type does not.
 **/
function behindLoadingPolicy<S extends object>(
  source: S,
  ensureFresh: EnsureFreshChains,
): S {
  return new Proxy(source, {
    get(target, property, receiver) {
      const value = Reflect.get(target, property, receiver);
      if (typeof value !== "function") {
        return value;
      }
      return async (...args: unknown[]) => {
        await ensureFresh();
        return Reflect.apply(value, target, args);
      };
    },
  });
}
