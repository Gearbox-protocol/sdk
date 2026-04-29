import type { TokenRef } from "./assets.js";
import type { YieldBreakdown } from "./yields.js";

export interface PoolCollateral {
  token: TokenRef;
  quotaLimit: number;
  quotaUsed: number;
  quotaRate: number;
  // price feeds
  // expectedWithdrawalTime: number;
}

export type StrategyCollateral = PoolCollateral & {
  // type: "target" | "withdrawal";
  liquidationThreshold: number;
  yield: YieldBreakdown;
  // maxCollateral: number; quotaLimit - quotaUsed / collateralPriceInUnderlying

  // expectedWithdrawalTime: number;
  // isWithdrawalGuaranteed: boolean;
  // maxCollateral: number; quotaLimit - quotaUsed / collateralPriceInUnderlying
  // isWithdrawalGuaranteed: boolean;
};

export type UserCollateral = StrategyCollateral & {
  balance: number;
  balanceUsd: number;
  quota: number;
  expectedWithdrawalTimestamp?: number;
};
