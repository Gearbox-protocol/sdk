import type { Address } from "viem";
import type {
  ExternalApy as ExternalApySDK,
  PoolExtraApy,
  PoolPointsInfo,
} from "../../rewards/apy/index.js";

// ---------------------------------------------------------------------------
// Base building blocks
// ---------------------------------------------------------------------------

export interface PoolBaseAPY {
  type: "supplyAPY" | "tokenYield";
  apy: number;
}

/**
 * External APY enriched with the cumulative `totalValue`
 * (base + extra + external).
 */
export interface PoolExternalAPY extends ExternalApySDK {
  totalValue: number;
}

// ---------------------------------------------------------------------------
// Per-pool APY result
// ---------------------------------------------------------------------------

export interface PoolFullAPY {
  totalAPY: number;
  baseAPY: PoolBaseAPY[];
  extraAPY: PoolExtraApy[];
  extraAPYTotal: number;
  externalAPY: PoolExternalAPY | undefined;
}

export interface PoolFullAPY7DAgo extends PoolFullAPY {
  loading7DAgo: boolean;
}

// ---------------------------------------------------------------------------
// Per-pool points result
// ---------------------------------------------------------------------------

export interface PoolPointsWithTips {
  reward?: PoolPointsInfo<string>;
  amount: string;
  name: string;
  tokenTitle?: string;
  fullTip: string;
}

// ---------------------------------------------------------------------------
// Aggregated result (per chain)
// ---------------------------------------------------------------------------

type AllPoolsAPY = Record<Address, PoolFullAPY>;
type AllPoolsAPY7DAgo = Record<Address, PoolFullAPY7DAgo>;
type AllPoolsPoints = Record<Address, PoolPointsWithTips[] | undefined>;

export interface GetPoolsAPYResult {
  data: AllPoolsAPY;
  data7DAgo: AllPoolsAPY7DAgo;
  points: AllPoolsPoints;
}
