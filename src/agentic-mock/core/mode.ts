/**
 * Mode system: the type-level machinery that controls which operations
 * are available on each entity based on active data sources.
 *
 * Each entity defines its own XxxOnchainOps / XxxOffchainOps interfaces.
 * Those are registered here in ModeCapabilities, the central manifest.
 * The Caps<M, E> utility resolves the correct intersection at any usage site.
 */
import type { RawTx } from "./types.js";

// ============================================================================
// Mode enum
// ============================================================================

export type Mode = "onchain" | "offchain";

// ============================================================================
// Per-entity operation interfaces (mode-specific surfaces)
// ============================================================================

export interface OnchainPoolOps {
  readonly kycRequired: boolean;
  createDepositTx(amount: bigint): RawTx;
}

export interface OffchainPoolOps {
  readonly apy: number;
  readonly description: string;
  loadHistoricalTvl(from: number, to: number): Promise<TvlChartData>;
}

export interface OnchainMarketOps {
  createDepositTx(amount: bigint): RawTx;
}

export interface OffchainMarketOps {
  readonly poolApy: number;
}

export interface TvlChartPoint {
  timestamp: number;
  tvl: number;
}
export type TvlChartData = TvlChartPoint[];

// ============================================================================
// Capability manifest
// ============================================================================

/**
 * Central registry: for each mode, what extra operations each entity gets.
 * Adding a new mode = add one key here + implement strategies.
 */
export interface ModeCapabilities {
  onchain: {
    Pool: OnchainPoolOps;
    Market: OnchainMarketOps;
  };
  offchain: {
    Pool: OffchainPoolOps;
    Market: OffchainMarketOps;
  };
}

// ============================================================================
// Conditional type utilities
// ============================================================================

/**
 * Non-distributive capability resolver.
 * Given a union of active modes `M`, produces the intersection of
 * matching operation interfaces for entity `E`.
 *
 * ```
 * Caps<'onchain', 'Pool'>                 → OnchainPoolOps
 * Caps<'offchain', 'Pool'>                → OffchainPoolOps
 * Caps<'onchain' | 'offchain', 'Pool'>    → OnchainPoolOps & OffchainPoolOps
 * ```
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
