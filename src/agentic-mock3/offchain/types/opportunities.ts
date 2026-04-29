import type { Address } from "viem";
import type { TokenRef } from "./assets.js";
import type { PoolCollateral, StrategyCollateral } from "./collaterals.js";
import type { YieldBreakdown } from "./yields.js";

export interface OpportunityAccess {
  kycRequired: boolean;
  kycUrl?: string | null;
}

export interface OpportunityRisk {
  level: "low" | "medium" | "high";
  warnings: string[];
}

export interface OpportunityBase {
  id: string;
  chainId: number;
  type: "pool" | "strategy";
  title: string;
  curatorId: string;
  underlyingToken: TokenRef;
  access: OpportunityAccess;
  risk: OpportunityRisk;
}

export interface PoolOpportunity extends OpportunityBase {
  type: "pool";
  poolAddress: Address;

  yield: YieldBreakdown;

  supplied: number;
  borrowed: number;
  availableLiquidity: string;
  utilization: number;

  tvl: number;
  tvlUsd: number;

  // isPaused: boolean;
  // irm info - how suplied liquidity change supply apy?

  // quota allocations by collaterals
  collaterals: PoolCollateral[];

  // debt allocations by strategies
  // (?)
}

////////

export interface StrategyOpportunity extends OpportunityBase {
  type: "strategy";
  creditManagerAddress: Address;
  poolAddress: Address;

  targetCollateral: TokenRef;
  // collaterals with non-zero LT and quota
  collaterals: StrategyCollateral[];

  // strategy info
  borrowed: number;
  totalValue: number;
  minDebt: number;
  maxDebt: number;
  borrowableLiquidity: number;

  maxLeverage: number;
  borrowApy: number;

  /** Headline: best yield achievable at max leverage on target collateral */
  maxLeveragedTargetCollateralYield: YieldBreakdown;
  /** Best collateral base yield without leverage */
  baseTargetCollateralYield: YieldBreakdown;
  // avgYield7d: YieldBreakdown;

  // isPaused?: boolean;
  hasDelayedWithdrawal: boolean;
}

export type Opportunity = PoolOpportunity | StrategyOpportunity;
