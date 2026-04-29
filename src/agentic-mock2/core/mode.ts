/**
 * Mode system: type-level machinery controlling which operations
 * are available on each entity based on active data sources.
 *
 * Implementation classes are never generic — they always have all methods.
 * The Mode parameter only restricts the PUBLIC type surface.
 *
 * Per-entity Ops interfaces live next to their entity definitions
 * (e.g. OnchainMarketOps in entities/market.ts). This file imports them
 * to build the central ModeCapabilities manifest.
 */
import type {
  OffchainMarketOps,
  OnchainMarketOps,
} from "../entities/market.js";
import type {
  OffchainOpportunityOps,
  OnchainOpportunityOps,
} from "../entities/opportunity.js";

// ============================================================================
// Mode enum
// ============================================================================

export type Mode = "onchain" | "offchain";

// ============================================================================
// Capability manifest
// ============================================================================

export interface ModeCapabilities {
  onchain: {
    Market: OnchainMarketOps;
    Opportunity: OnchainOpportunityOps;
  };
  offchain: {
    Market: OffchainMarketOps;
    Opportunity: OffchainOpportunityOps;
  };
}

// ============================================================================
// Conditional type utilities
// ============================================================================

/**
 * Non-distributive capability resolver.
 * Given a union of active modes `M`, produces the intersection of
 * matching operation interfaces for entity `E`.
 */
export type Caps<M extends Mode, E extends string> = ("onchain" extends M
  ? E extends keyof ModeCapabilities["onchain"]
    ? ModeCapabilities["onchain"][E]
    : unknown
  : unknown) &
  ("offchain" extends M
    ? E extends keyof ModeCapabilities["offchain"]
      ? ModeCapabilities["offchain"][E]
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
