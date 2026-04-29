/**
 * Mode system: type-level machinery controlling which operations
 * are available on each entity based on active data sources.
 *
 * Implementation classes are never generic -- they always have all methods.
 * The Mode parameter only restricts the PUBLIC type surface.
 *
 * Per-entity Ops interfaces live next to their entity definitions.
 * This file imports them to build the central ModeCapabilities manifest.
 */
/** biome-ignore-all lint/complexity/noBannedTypes: <we want to be explicit about capabilities> */
import type {
  OffchainMarketCollectionOps,
  OffchainMarketOps,
  OnchainMarketOps,
} from "../market/ops.js";

export type Mode = "onchain" | "offchain";

export interface ModeCapabilities<M extends Mode = Mode> {
  onchain: {
    Market: OnchainMarketOps;
    MarketCollection: {};
  };
  offchain: {
    Market: OffchainMarketOps;
    MarketCollection: OffchainMarketCollectionOps<M>;
  };
}

/**
 * Non-distributive capability resolver.
 * Given a union of active modes `M`, produces the intersection of
 * matching operation interfaces for entity `E`.
 */
export type Caps<M extends Mode, E extends string> = ("onchain" extends M
  ? E extends keyof ModeCapabilities<M>["onchain"]
    ? ModeCapabilities<M>["onchain"][E]
    : unknown
  : unknown) &
  ("offchain" extends M
    ? E extends keyof ModeCapabilities<M>["offchain"]
      ? ModeCapabilities<M>["offchain"][E]
      : unknown
    : unknown);

/** Resolves to `T` only when both onchain and offchain modes are active. */
export type IfBothModes<M extends Mode, T> = "onchain" extends M
  ? "offchain" extends M
    ? T
    : unknown
  : unknown;

/** Resolves to `T` when offchain mode is active. */
export type IfOffchain<M extends Mode, T> = "offchain" extends M ? T : unknown;
