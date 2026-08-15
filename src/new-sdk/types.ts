import type { ChainId, ResponseMetadata } from "../model/index.js";
import type { GearboxAPI, GearboxAPIOptions } from "../offchain/index.js";
import type {
  MultichainAttachOptions,
  MultichainSDK,
  MultichainSDKOptions,
  NetworkType,
} from "../sdk/index.js";
import type { ILogger } from "../sdk/types/logger.js";

/**
 * Which sources a {@link GearboxSDK} reads from. Fixed at construction: a
 * running instance never changes mode, and the mode decides which methods
 * exist at all rather than what they return.
 **/
export type Mode = "onchain" | "offchain" | "both";

/**
 * Thrown when a read had sources to ask and none of them served a single chain.
 *
 * A read that partially succeeded never throws: it returns what it has and
 * reports the rest per chain in its metadata.
 **/
export class AllSourcesFailedError extends Error {
  /**
   * Outcome of every chain the failed read covered.
   **/
  public readonly meta: ResponseMetadata;

  constructor(action: string, meta: ResponseMetadata) {
    const reasons = meta.chains
      .filter(chain => chain.status === "error")
      .map(chain => `${chain.chainId}: ${chain.error}`);
    super(`cannot ${action}, every source failed (${reasons.join("; ")})`);
    this.name = "AllSourcesFailedError";
    this.meta = meta;
  }
}

/**
 * On-chain source of a {@link GearboxSDK}: either an already-attached SDK to
 * reuse, or the options to build one with.
 *
 * An injected instance is never re-attached — its owner decides when it syncs.
 **/
export type OnchainSource = MultichainSDK | PlainMultichainSDKOptions;

/**
 * {@link MultichainSDKOptions} without plugin typing.
 *
 * The facade exposes the on-chain SDK as a plain `MultichainSDK`; a consumer
 * that injects a plugin-typed instance keeps its own typed reference to it.
 **/
// biome-ignore lint/complexity/noBannedTypes: matches the SDK's own plugin default
export type PlainMultichainSDKOptions = MultichainSDKOptions<{}>;

/**
 * Off-chain source of a {@link GearboxSDK}: either a client to reuse or the
 * options to build one with.
 *
 * The chains are not among those options — {@link GearboxSDKOptions.networks}
 * decides them. An injected client must already cover exactly those.
 **/
export type OffchainSource = GearboxAPI | Omit<GearboxAPIOptions, "chainIds">;

/**
 * Options for creating a {@link GearboxSDK}.
 *
 * @typeParam M - Mode, which decides which sources are required.
 **/
export interface GearboxSDKOptions<M extends Mode = Mode> {
  /**
   * Sources to read from, see {@link Mode}.
   **/
  mode: M;
  /**
   * Chains the SDK covers, which every read of every source is scoped to.
   *
   * This list is authoritative: a source built here covers exactly these
   * chains, and an injected one that covers a different set is rejected at
   * construction rather than silently read outside its scope.
   **/
  networks: NetworkType[];
  /**
   * On-chain source. Required in `onchain` and `both` mode.
   **/
  onchain?: OnchainSource;
  /**
   * Off-chain source. Required in `offchain` and `both` mode.
   **/
  offchain?: OffchainSource;
  /**
   * How many seconds the backend may lag the chain and still serve a chain in
   * `both` mode, see {@link DEFAULT_MAX_OFFCHAIN_LAG}.
   *
   * One value for every chain and every namespace. A read that needs its own
   * rule passes a custom merger instead of asking for a second threshold.
   **/
  maxOffchainLagSeconds?: number;
  /**
   * Options passed to {@link MultichainSDK.attach}, used only when the SDK
   * builds the on-chain source itself.
   **/
  attach?: MultichainAttachOptions;
  /**
   * Logger for source selection and degradation diagnostics.
   **/
  logger?: ILogger;
}

/**
 * What a {@link GearboxSDK} hands every namespace it builds.
 **/
export interface NamespaceOptions {
  /**
   * Chains the SDK covers, which is what a failed read is reported over. The
   * sources scope their own requests, so this is not passed on to them.
   **/
  chainIds: ChainId[];
  /**
   * How far the backend may lag the chain, see
   * {@link GearboxSDKOptions.maxOffchainLagSeconds}.
   **/
  maxOffchainLagSeconds: number;
  /**
   * Logger for source selection diagnostics.
   **/
  logger?: ILogger;
}

/**
 * On-chain escape hatch per mode: absent when the SDK reads no chain.
 *
 * @internal
 **/
export interface OnchainByMode {
  onchain: MultichainSDK;
  offchain: undefined;
  both: MultichainSDK;
}

/**
 * Off-chain escape hatch per mode: absent when the SDK reads no backend.
 *
 * @internal
 **/
export interface OffchainByMode {
  onchain: undefined;
  offchain: GearboxAPI;
  both: GearboxAPI;
}
