import type { GearboxAPI, GearboxAPIOptions } from "../offchain/index.js";
import type {
  MultichainAttachOptions,
  MultichainNetworkMeta,
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
 * Outcome of the off-chain read behind a response.
 **/
export interface OffchainSourceStatus {
  /**
   * Whether the backend served the request.
   **/
  status: "success" | "error";
  /**
   * Rejection reason. Only set when {@link status} is `"error"`.
   **/
  error?: unknown;
}

/**
 * Which sources produced a response and which of them failed.
 *
 * Meta is always present, in every mode. A partial answer is the normal case
 * for a multi-chain read, so a caller that ignores this block is choosing to
 * treat "one chain is down" as "these opportunities do not exist".
 **/
export interface SourceMeta {
  /**
   * Outcome per queried chain. Empty when the read touched no chain, either
   * because the SDK is off-chain or because a filter selected no chain.
   **/
  chains: MultichainNetworkMeta[];
  /**
   * Outcome of the off-chain read, absent when the SDK has no backend source.
   **/
  offchain?: OffchainSourceStatus;
}

/**
 * What every {@link GearboxSDK} read returns.
 *
 * @typeParam T - Payload type.
 **/
export interface ReadResult<T> {
  /**
   * Requested payload, built from every source that answered.
   **/
  result: T;
  /**
   * Which sources produced it, see {@link SourceMeta}.
   **/
  meta: SourceMeta;
}

/**
 * Thrown when a read had sources to ask and none of them answered.
 *
 * A read that partially succeeded never throws: it returns what it has and
 * reports the rest in {@link SourceMeta}.
 **/
export class AllSourcesFailedError extends Error {
  /**
   * Outcome of every source the failed read asked.
   **/
  public readonly meta: SourceMeta;

  constructor(action: string, meta: SourceMeta) {
    const reasons = [
      ...meta.chains
        .filter(c => c.status === "error")
        .map(c => `${c.network}: ${c.error}`),
      ...(meta.offchain?.status === "error"
        ? [`offchain: ${meta.offchain.error}`]
        : []),
    ];
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
 **/
export type OffchainSource = GearboxAPI | GearboxAPIOptions;

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
   * Chains the SDK covers. This list is authoritative: when {@link onchain} is
   * an already-attached instance covering a different set of chains, the
   * mismatch is logged and this list still decides what is read.
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
