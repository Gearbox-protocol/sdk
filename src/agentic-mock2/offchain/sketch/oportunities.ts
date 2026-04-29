import type { Address } from "viem";
import type { TokenRef } from "./assets.js";

export type OpportunityKind = "pool" | "strategy" | "market";
export type YieldType = "organic" | "incentivized" | "mixed";

// ═══════════════════════════════════════════════════════════════
// Common Types
// ═══════════════════════════════════════════════════════════════

export interface TokenReward {
  type: "tokens";
  rewardToken: TokenRef;
  apy: number;
}

export interface PointsReward {
  type: "points";
  name: string;
  multiplier: number;
  condition: "deposit" | "cross-chain-deposit" | "holding";
}

export interface Incentive {
  type: "tokens" | "points";
  reward: TokenReward | PointsReward;
  description: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

export interface ClaimableIncentive extends Incentive {
  availableToClaim: number;
}

// ═══════════════════════════════════════════════════════════════
// APY Breakdown
// ═══════════════════════════════════════════════════════════════

export interface BasicApyBreakdown {
  basicApy: number;
  // underlyingApy: number;
}

interface PoolCollateral {
  token: TokenRef;
  quotaLimit: number;
  quotaUsed: number;
  quotaRate: number;
  // price feeds
}

interface StrategyCollateral extends PoolCollateral {
  liquidationThreshold: number;
  basicApy: number;
  incentives: Incentive[];
  // maxCollateral: number; quotaLimit - quotaUsed / collateralPriceInUnderlying

  // expectedWithdrawalTime: number;
  // isWithdrawalGuaranteed: boolean;
}

interface UserCollateral extends StrategyCollateral {
  balance: number;
  quota: number;
  incentives: ClaimableIncentive[];
}

// ═══════════════════════════════════════════════════════════════
// Opportunities
// ═══════════════════════════════════════════════════════════════

export interface Opportunity {
  id: string;
  chainId: number;
  type: "pool" | "strategy";
  title: string;
  curatorId: string;
  underlyingToken: TokenRef;
  access: {
    permissionless: boolean;
    kycRequired: boolean;
    kycUrl?: string | null;
  };
  risk: {
    summary?: string | null;
    warnings: string[];
  };
}

export interface PoolOpportunity extends Opportunity {
  type: "pool";
  poolAddress: Address;

  supplyApy: number;
  incentives: Incentive[];

  available: number;
  borrowed: number;
  utilization: number;

  tvl: string;
  tvlUsd: number;

  availableLiquidity: string;
  // isPaused: boolean;

  // irm info - how suplied liquidity change supply apy?

  collaterals: PoolCollateral[];
}

// PoolOpportunityEnriched
// supplyApy7d: number;
// avgSupplyApy30D: number;
// incentives7d: Incentive[];

////////

export interface StrategyOpportunity extends Opportunity {
  type: "strategy";

  minDebt: string;
  maxDebt: string;
  borrowableLiquidity: string;
  maxLeverage: number;

  borrowApy: number;

  maxLevarageApy: number; // (?) breakdown (basic apy + token rewards + points rewards)
  basicApy: number; // (?) breakdown (basic apy + token rewards + points rewards)

  collaterals: StrategyCollateral[];

  isPaused?: boolean;
  hasDelayedWithdrawal: boolean;
}

// ═══════════════════════════════════════════════════════════════
// Positions
// ═══════════════════════════════════════════════════════════════

export interface UserPoolPosition {
  chainId: number;
  poolAddress: Address;

  depositSize: number;
  supplyApy: number;
  incentives: ClaimableIncentive[];

  pnl: number; // without points?
  pnlUSD: number;
  // ? position ops
}

export interface UserStrategyPosition {
  chainId: number;
  poolAddress: Address;
  creditManagerAddress: Address;
  creditAccountAddress: Address;

  // apy
  // apy7d
  // avgApy1D (?) - defillama
  // avgApy7D (?)
  pnl: number;
  pnlUSD: number;
  // ? position ops

  leverage: number;
  debt: number;
  debtUSD: number;
  healthFactor: number;

  apy: number;
  borrowRate: number;

  // non-zero LT collaterals
  collaterals: UserCollateral[];
}
