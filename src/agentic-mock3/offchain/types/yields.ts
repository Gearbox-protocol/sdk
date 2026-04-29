import type { TokenRef } from "./assets.js";

export interface IncentiveBase {
  id?: string;
  description: string;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
}

export interface TokenIncentive extends IncentiveBase {
  type: "tokens";
  rewardToken: TokenRef;
  apy: number;
}

export interface PointsIncentive extends IncentiveBase {
  type: "points";
  name: string;
  /** Points earned per day per $1,000 USD of position size */
  // dailyEmissionPer1kUsd?: number;
  multiplier?: number;
}

export type Incentive = TokenIncentive | PointsIncentive;

/** Breakdown of all current yield rates for an opportunity or position */
export interface YieldBreakdown {
  /** Organic yield APY from the protocol (supply rate, farming, etc.) */
  baseApy: number;
  /** All active incentive programs (token rewards + points) */
  incentives: Incentive[];
  /** sum of baseApy + all token incentives' APY */
  totalApy: number;
}
