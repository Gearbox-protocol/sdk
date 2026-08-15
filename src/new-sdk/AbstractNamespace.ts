import type { ChainId } from "../model/index.js";
import type { GearboxAPI, OffchainResult } from "../offchain/index.js";
import { getNetworkType } from "../sdk/chain/chains.js";
import type {
  MultichainNetworkMeta,
  MultichainSDK,
  NetworkType,
} from "../sdk/index.js";
import type { ILogger } from "../sdk/types/logger.js";
import type { OffchainSourceStatus, ReadResult, SourceMeta } from "./types.js";
import { AllSourcesFailedError } from "./types.js";

/**
 * What the on-chain source contributed, after per-chain failures have been
 * turned into metadata.
 *
 * @internal
 **/
export interface OnchainContribution<T> {
  value?: T;
  chains: MultichainNetworkMeta[];
}

/**
 * What the off-chain source contributed, after a rejection has been turned into
 * metadata.
 *
 * @internal
 **/
export interface OffchainContribution<T> {
  value?: T;
  status?: OffchainSourceStatus;
}

/**
 * How a read turns the two contributions into one payload. Either side is
 * absent when its source was not asked, or was asked and failed.
 *
 * @internal
 **/
export type CombineSources<T> = (
  onchain: T | undefined,
  offchain: T | undefined,
) => T;

/**
 * Shared machinery of every {@link GearboxSDK} namespace.
 *
 * A namespace is a stateless router: it asks the sources its mode allows, in
 * parallel, merges what came back and reports what did not. This class owns
 * that routing — per-chain failure capture, backend degradation, the response
 * envelope and the all-sources-failed rule — so a namespace holds nothing but
 * its reads and its merge policy.
 *
 * The sources are whatever it was handed, and their readiness is their owner's
 * business: a source that is not ready to answer fails the read it was given,
 * and that failure is reported like any other.
 *
 * All protocol knowledge lives in the sources: `MultichainSDK` for the chain,
 * `GearboxAPI` for the backend. None of it is repeated here or in a subclass.
 *
 * @typeParam ListRow - Row type of the namespace's list read.
 **/
export abstract class AbstractNamespace<ListRow extends object> {
  protected readonly logger?: ILogger;

  readonly #onchain?: MultichainSDK;
  readonly #offchain?: GearboxAPI;

  protected constructor(
    name: string,
    onchain: MultichainSDK | undefined,
    offchain: GearboxAPI | undefined,
    logger?: ILogger,
  ) {
    this.#onchain = onchain;
    this.#offchain = offchain;
    this.logger = logger?.child?.({ name }) ?? logger;
  }

  /**
   * Per-field source policy for one row of this namespace.
   **/
  protected abstract mergeOne<T extends object>(onchain: T, offchain: T): T;

  /**
   * Union policy for this namespace's list read.
   **/
  protected abstract mergeList(
    onchain: ListRow[],
    offchain: ListRow[],
  ): ListRow[];

  /**
   * Asks both sources in parallel and combines whatever answered.
   *
   * The action name is only used in diagnostics and in the error raised when
   * every source the read had failed.
   **/
  protected async read<T>(
    action: string,
    fromChain: (sdk: MultichainSDK) => Promise<OnchainContribution<T>>,
    fromBackend: (api: GearboxAPI) => Promise<OffchainResult<T>>,
    combine: CombineSources<T>,
  ): Promise<ReadResult<T>> {
    const [onchain, offchain] = await Promise.all([
      this.fromChain(fromChain),
      this.fromBackend(fromBackend),
    ]);

    const meta = toMeta(onchain, offchain);
    this.assertAnySourceSucceeded(action, meta);

    return { result: combine(onchain.value, offchain.value), meta };
  }

  /**
   * Reads the namespace's list from both sources, unioned by
   * {@link AbstractNamespace.mergeList}.
   **/
  protected async readList(
    action: string,
    fromChain: (sdk: MultichainSDK) => Promise<OnchainContribution<ListRow[]>>,
    fromBackend: (api: GearboxAPI) => Promise<OffchainResult<ListRow[]>>,
  ): Promise<ReadResult<ListRow[]>> {
    // a source that answered with nothing still contributes an empty list,
    // which is a different thing from a source that failed and was dropped
    return this.read(action, fromChain, fromBackend, (onchain, offchain) =>
      this.mergeList(onchain ?? [], offchain ?? []),
    );
  }

  /**
   * Reads one row from both sources and merges them under
   * {@link AbstractNamespace.mergeOne}. The key names the chain, so the
   * on-chain leg queries exactly one.
   **/
  protected async readOne<T extends object>(
    action: string,
    chainId: ChainId,
    fromChain: (sdk: MultichainSDK) => Promise<T>,
    fromBackend: (api: GearboxAPI) => Promise<OffchainResult<T>>,
  ): Promise<ReadResult<T>> {
    return this.read(
      action,
      async sdk => {
        const network = this.networkOf(chainId);
        if (!network) {
          return { chains: [] };
        }
        return this.onOneChain(action, network, () => fromChain(sdk));
      },
      fromBackend,
      (onchain, offchain) => {
        if (onchain && offchain) {
          return this.mergeOne(onchain, offchain);
        }
        // the all-sources-failed rule guarantees one of the two is set
        return (onchain ?? offchain) as T;
      },
    );
  }

  /**
   * Reads something only the chain can answer.
   *
   * Unlike {@link AbstractNamespace.readOne} there is no second source to fall
   * back to, so an absent on-chain source or a chain the SDK does not cover
   * throws: an empty answer would be indistinguishable from a real one.
   **/
  protected async readOnchain<T>(
    action: string,
    chainId: ChainId,
    fromChain: (sdk: MultichainSDK) => Promise<T>,
  ): Promise<ReadResult<T>> {
    const network = this.networkOf(chainId);
    const onchain = await this.fromChain(async sdk =>
      network
        ? this.onOneChain(action, network, () => fromChain(sdk))
        : { chains: [] },
    );

    const meta = toMeta(onchain, {});
    if (onchain.value === undefined) {
      throw new AllSourcesFailedError(action, meta);
    }
    return { result: onchain.value, meta };
  }

  /**
   * Reads something only the backend can answer.
   *
   * The fallback stands in for a backend that answered with nothing, which is
   * a different thing from a backend that failed and was dropped.
   **/
  protected async readOffchain<T>(
    action: string,
    fromBackend: (api: GearboxAPI) => Promise<OffchainResult<T>>,
    fallback: T,
  ): Promise<ReadResult<T>> {
    const offchain = await this.fromBackend(fromBackend);
    const meta = toMeta({ chains: [] }, offchain);
    this.assertAnySourceSucceeded(action, meta);
    return { result: offchain.value ?? fallback, meta };
  }

  /**
   * Runs a read against the chain, or reports the chain as absent when the
   * namespace has no on-chain source at all.
   **/
  protected async fromChain<T>(
    run: (sdk: MultichainSDK) => Promise<OnchainContribution<T>>,
  ): Promise<OnchainContribution<T>> {
    return this.#onchain ? run(this.#onchain) : { chains: [] };
  }

  /**
   * Runs a read against the backend, turning any rejection into metadata so
   * that a dead backend degrades a `both`-mode read instead of failing it.
   **/
  protected async fromBackend<T>(
    run: (api: GearboxAPI) => Promise<OffchainResult<T>>,
  ): Promise<OffchainContribution<T>> {
    if (!this.#offchain) {
      return {};
    }
    try {
      const { result, meta } = await run(this.#offchain);
      return {
        value: meta.status === "success" ? result : undefined,
        status: meta,
      };
    } catch (error) {
      this.logger?.warn(error, "offchain read failed");
      return { status: { status: "error", error } };
    }
  }

  /**
   * Runs a read against one chain, turning a rejection into that chain's
   * metadata entry.
   **/
  protected async onOneChain<T>(
    action: string,
    network: NetworkType,
    run: () => Promise<T>,
  ): Promise<OnchainContribution<T>> {
    try {
      return { value: await run(), chains: [{ network, status: "success" }] };
    } catch (error) {
      this.logger?.warn(error, `failed to ${action} on ${network}`);
      return { chains: [{ network, status: "error", error }] };
    }
  }

  /**
   * A read that reached at least one source returns what it has; a read where
   * every source it had failed throws, because an empty result would otherwise
   * be indistinguishable from "there is nothing here".
   **/
  protected assertAnySourceSucceeded(action: string, meta: SourceMeta): void {
    const asked = meta.chains.length > 0 || meta.offchain !== undefined;
    const answered =
      meta.chains.some(c => c.status === "success") ||
      meta.offchain?.status === "success";
    if (asked && !answered) {
      throw new AllSourcesFailedError(action, meta);
    }
  }

  protected networkOf(chainId: ChainId): NetworkType | undefined {
    try {
      return getNetworkType(chainId);
    } catch {
      this.logger?.debug(
        `chain ${chainId} is not a Gearbox network, skipping the onchain source`,
      );
      return undefined;
    }
  }
}

function toMeta(
  onchain: OnchainContribution<unknown>,
  offchain: OffchainContribution<unknown>,
): SourceMeta {
  const meta: SourceMeta = { chains: onchain.chains };
  if (offchain.status) {
    meta.offchain = offchain.status;
  }
  return meta;
}
