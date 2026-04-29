import type { Address } from "viem";
import type { TokenRef } from "./assets.js";
import type { UserCollateral } from "./collaterals.js";
import type { YieldBreakdown } from "./yields.js";

export interface UserPoolPosition {
  chainId: number;
  poolAddress: Address;

  depositSize: number;
  depositSizeUsd: number;

  /** Current rates the position is earning */
  yield: YieldBreakdown;

  /** Accumulated earnings and rewards */
  pnl: PnlBreakdown;
}

export interface UserStrategyPosition {
  chainId: number;
  poolAddress: Address;
  creditManagerAddress: Address;
  creditAccountAddress: Address;

  leverage: number;

  /** Current borrow rate */
  borrowApy: number;
  /** Current net APY for the whole position */
  netApy: number;

  debt: number;
  debtUsd: number;
  healthFactor: number;

  /** Accumulated earnings and rewards */
  pnl: PnlBreakdown;

  collaterals: UserCollateral[];
}

export interface TokenRewardAmount {
  rewardToken: TokenRef;
  claimable: number;
  claimableUsd: number;
  claimed: number;
  claimedUsd: number;
}

export interface PointsRewardAmount {
  name: string;
  earned: number;
}

export interface PnlBreakdown {
  /** PnL from organic yield (interest earned or farming) */
  interest: number;
  interestUsd: number;

  /** Accumulated token rewards */
  tokenRewards: TokenRewardAmount[];
  /** Sum of all claimable + claimed token rewards in USD */
  tokenRewardsUsd: number;

  /** Earned points per program */
  points: PointsRewardAmount[];

  /** interestUsd + tokenRewardsUsd (points excluded — not monetary) */
  totalUsd: number;
}
