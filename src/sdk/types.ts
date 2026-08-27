import type {
  ChainId,
  DataResponse,
  Notice,
  NoticeSubject,
} from "../model/index.js";
import type { GearboxAPI, GearboxAPIOptions } from "../offchain/index.js";
import type {
  MultichainAttachOptions,
  MultichainSDK,
  MultichainSDKOptions,
  NetworkType,
} from "../onchain/index.js";
import type { ILogger } from "../onchain/types/logger.js";
import type { ILiquidationsByMode } from "./liquidations/types.js";
import type { IOpportunities } from "./opportunities/types.js";
import type { IPositions } from "./positions/types.js";
import type { IPreviewByMode } from "./preview/types.js";

/**
 * Which sources a {@link GearboxSDK} reads from, and therefore which of its
 * methods exist.
 **/
export type Mode = "onchain" | "offchain" | "both";

/**
 * On-chain source of a {@link GearboxSDK}: either an SDK to reuse, which its
 * owner keeps attaching itself, or the options to build one with.
 **/
export type OnchainSource = MultichainSDK | PlainMultichainSDKOptions;

/**
 * {@link MultichainSDKOptions} without plugin typing.
 **/
// biome-ignore lint/complexity/noBannedTypes: matches the SDK's own plugin default
export type PlainMultichainSDKOptions = MultichainSDKOptions<{}>;

/**
 * Off-chain source of a {@link GearboxSDK}: either a client to reuse or the
 * options to build one with. The chains come from
 * {@link GearboxSDKOptions.networks} either way.
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
   * Chains the SDK covers, which every read of every source is scoped to. An
   * injected source covering a different set is rejected at construction.
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
   **/
  maxOffchainLagSeconds?: number;
  /**
   * How old the loaded on-chain state may be, in seconds, before a read syncs
   * the chains it touches first, see {@link DEFAULT_MAX_STATE_AGE}. A read
   * inside the window is served from loaded state.
   **/
  maxStateAgeSeconds?: number;
  /**
   * Options passed to {@link MultichainSDK.attach}, used only when the SDK
   * builds the on-chain source itself.
   **/
  attach?: MultichainAttachOptions;
  logger?: ILogger;
}

/**
 * What a namespace asks of the on-chain state before it reads it: attached,
 * and no older than the SDK's `maxStateAgeSeconds` on the chains the read
 * touches. Owned by {@link GearboxSDK}, which shares one attach and one
 * in-flight sync per chain across every namespace.
 *
 * @internal
 **/
export type EnsureFreshChains = (
  chainIds?: readonly ChainId[],
) => Promise<void>;

/**
 * What a {@link GearboxSDK} hands every namespace it builds.
 **/
export interface NamespaceOptions {
  /**
   * How far the backend may lag the chain, see
   * {@link GearboxSDKOptions.maxOffchainLagSeconds}.
   **/
  maxOffchainLagSeconds: number;
  /**
   * Awaited before every on-chain leg of an async read, see
   * {@link EnsureFreshChains}. Absent when the SDK reads no chain.
   **/
  ensureFresh?: EnsureFreshChains;
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
 * The banners the backend attaches to a pool opportunity or a strategy
 * position, see {@link Notice}.
 **/
export interface INotices {
  (subject: NoticeSubject): Promise<DataResponse<Notice[]>>;
}

/**
 * `sdk.notices` per mode: a backend read, absent when the SDK reads no backend.
 **/
export interface INoticesByMode {
  onchain: undefined;
  offchain: INotices;
  both: INotices;
}

/**
 * Public contract of {@link GearboxSDK}: every namespace and sub-construction,
 * gated by {@link Mode}. Escape hatches `onchain` and `offchain` are not part
 * of this surface.
 *
 * @typeParam M - Mode the instance was built in.
 **/
export interface IGearboxSDK<M extends Mode = Mode> {
  /**
   * Sources this instance reads from.
   **/
  readonly mode: M;
  /**
   * Chains this instance covers, which every read is scoped to.
   **/
  readonly networks: readonly NetworkType[];
  /**
   * Whether the on-chain source is ready to be read from. Always `true` in
   * `offchain` mode.
   **/
  readonly attached: boolean;
  /**
   * Attaches the on-chain SDK when this instance owns one; a no-op in
   * `offchain` mode and when an already-attached SDK was injected.
   **/
  attach(): Promise<void>;
  /**
   * Namespace for pool and strategy opportunities.
   **/
  readonly opportunities: IOpportunities<M>;
  /**
   * Namespace for the positions a wallet holds.
   **/
  readonly positions: IPositions<M>;
  /**
   * Namespace for liquidatable credit accounts and delayed-withdrawal
   * positions a liquidator holds. Absent in `offchain` mode.
   **/
  readonly liquidations: ILiquidationsByMode[M];
  /**
   * Namespace for on-chain previews of raw operation calldata. Absent in
   * `offchain` mode.
   **/
  readonly preview: IPreviewByMode[M];
  /**
   * The banners the backend attaches to a pool opportunity or a strategy
   * position, see {@link Notice}. Absent in `onchain` mode.
   **/
  readonly notices: INoticesByMode[M];
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
