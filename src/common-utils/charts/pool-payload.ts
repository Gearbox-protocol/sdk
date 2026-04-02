import type { Address } from "viem";

export interface ChartsPoolDataPayload {
  addr: Address;
  dieselToken: Address;
  underlyingToken: Address;
  isWETH: boolean;
  version: number;
  name: string;

  borrowAPY_RAY: string;
  depositAPY_RAY: string;
  dieselRate_RAY: string;
  lmAPY: number;
  lmRewardAll: Array<{ apy: number; token: Address }>;

  earned7D: number;
  earned7DInUSD: number;

  availableLiquidity: string;
  availableLiquidityOld: string;
  availableLiquidity10kBasis: number;
  availableLiquidityInUSD: number;

  expectedLiqWeekAgo: number;
  expectedLiquidity: string;
  expectedLiquidityOld: string;
  expectedLiquidity10kBasis: number;
  expectedLiquidityInUSD: number;
  expectedLiquidityLimit: string;
  expectedLiquidityLimitInUSD: number;

  caLockedValue: number;
  caLockedValueOld: number;
  caLockedValue10kBasis: number;
  caLockedValueUSD: number;

  totalBorrowed: string;
  totalBorrowedOld: string;
  totalBorrowed10kBasis: number;
  totalBorrowedInUSD: number;

  debtWithInterest: string;
  debtWithInterest10kBasis: number;
  debtWithInterestInUSD: number;
  debtWithInterestOld: string;

  withdrawFee: number;

  addLiqCount: number;
  addedLiquidity: number;
  removeLiqCount: number;
  removedLiquidity: number;

  depositAPY1DAverage: number;
  depositAPY1DAverage10kBasis: number;
  depositAPY7DAverage: number;
  depositAPY30DAverage: number;

  uniqueLPsOld: number;
  uniqueLPs: number;
  uniqueLPs10kBasis: number;

  market: Address;
}

export interface ChartsAggregatedStats {
  caLockedValue: number;
  caLockedValue10kBasis: number;

  expectedLiquidity: number;
  expectedLiquidity10kBasis: number;

  totalBorrowed: number;
  totalBorrowed10kBasis: number;

  totalValue: number;
  totalValue10kBasis: number;

  debtWithInterest: number;
  debtWithInterest10kBasis: number;

  earned7D: number;
  uniqueLPs: number;
}

export interface ChartsAggregatedPoolPayload extends ChartsAggregatedStats {
  pools: Array<ChartsPoolDataPayload>;
}

export interface UserPoolPayload {
  pool: Address;
  dieselSym: string;
  dieselToken: Address;
  underlyingToken: Address;

  liqValue: string;
  liqValueInUSD: number;

  dieselBalance: number;
  dieselBalanceBI: string;

  lmRewards: string;
  lmRewardsInUSD: number;
  userRewards: Array<{
    lmRewards: string;
    lmRewardsInUSD: number;
    pool: Address;
    rewardToken: Address;
  }>;

  liqPnlInNativeToken: number;
  liqPnlInUSD: number;

  addedLiq: number;
  addLiqCount: number;

  removeLiqCount: number;
  removedLiq: number;

  depositAPY_RAY: string;
  lmAPY: number;
  lmRewardAll: Array<{ apy: number; token: Address }>;

  market: Address;
}

export interface UserPoolAggregatedStatsPayload {
  totalLMRewards: number;
  totalLiqInUSD: number;
  totalLiqt7DInUSD: number;
  totalLiqt10kBasis: number;
  user: Address;
  pools: Array<UserPoolPayload>;
}
