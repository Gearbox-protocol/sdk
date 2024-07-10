import { Address } from "viem";

import { BigNumberish } from "../utils/formatter";

export interface PoolDataPayload {
  addr: Address;
  underlying: Address;
  dieselToken: Address;
  symbol: string;
  name: string;
  baseInterestIndex: bigint;
  availableLiquidity: bigint;
  expectedLiquidity: bigint;
  totalBorrowed: bigint;
  totalDebtLimit: bigint;
  totalAssets: bigint;
  totalSupply: bigint;
  supplyRate: bigint;
  baseInterestRate: bigint;
  dieselRate_RAY: bigint;
  withdrawFee: bigint;
  lastBaseInterestUpdate: bigint;
  baseInterestIndexLU: bigint;
  version: bigint;
  poolQuotaKeeper: Address;
  gauge: Address;
  isPaused: boolean;

  readonly lirm: {
    interestModel: Address;
    version: bigint;
    U_1: number;
    U_2: number;
    R_base: number;
    R_slope1: number;
    R_slope2: number;
    R_slope3: number;
    isBorrowingMoreU2Forbidden: boolean;
  };

  quotas: readonly {
    token: Address;
    rate: number;
    quotaIncreaseFee: number;
    totalQuoted: bigint;
    limit: bigint;
    isActive: boolean;
  }[];

  zappers: readonly PoolZapper[];

  creditManagerDebtParams: readonly {
    creditManager: Address;
    borrowed: bigint;
    limit: bigint;
    availableToBorrow: bigint;
  }[];
}
export interface PoolDataExtraPayload {
  stakedDieselToken: Array<Address>;
  stakedDieselToken_old: Array<Address>;
  supplyAPY7D: number | undefined;
}

export interface LinearModel {
  interestModel: Address;
  version: number;
  U_1: bigint;
  U_2: bigint;
  R_base: bigint;
  R_slope1: bigint;
  R_slope2: bigint;
  R_slope3: bigint;
  isBorrowingMoreU2Forbidden: boolean;
}

export interface PoolZapper {
  zapper: Address;
  tokenIn: Address;
  tokenOut: Address;
}

export interface ChartsPoolDataPayload {
  addr: string;
  dieselToken: string;
  underlyingToken: string;
  isWETH: boolean;
  version: number;
  name: string;

  borrowAPY_RAY: BigNumberish;
  depositAPY_RAY: BigNumberish;
  dieselRate_RAY: BigNumberish;
  lmAPY: number;
  lmRewardAll: Array<{ apy: number; token: string }>;

  earned7D: number;
  earned7DInUSD: number;

  availableLiquidity: BigNumberish;
  availableLiquidityOld: BigNumberish;
  availableLiquidity10kBasis: number;
  availableLiquidityInUSD: number;

  expectedLiqWeekAgo: number;
  expectedLiquidity: BigNumberish;
  expectedLiquidityOld: BigNumberish;
  expectedLiquidity10kBasis: number;
  expectedLiquidityInUSD: number;
  expectedLiquidityLimit: BigNumberish;
  expectedLiquidityLimitInUSD: number;

  caLockedValue: number;
  caLockedValueOld: number;
  caLockedValue10kBasis: number;
  caLockedValueUSD: number;

  totalBorrowed: BigNumberish;
  totalBorrowedOld: BigNumberish;
  totalBorrowed10kBasis: number;
  totalBorrowedInUSD: number;

  debtWithInterest: BigNumberish;
  debtWithInterest10kBasis: number;
  debtWithInterestInUSD: number;
  debtWithInterestOld: BigNumberish;

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
  pool: string;
  dieselSym: string;
  dieselToken: string;
  underlyingToken: string;

  liqValue: BigNumberish;
  liqValueInUSD: number;

  dieselBalance: number;
  dieselBalanceBI: BigNumberish;

  lmRewards: BigNumberish;
  lmRewardsInUSD: number;

  liqPnlInNativeToken: number;
  liqPnlInUSD: number;

  addedLiq: number;
  addLiqCount: number;

  removeLiqCount: number;
  removedLiq: number;

  depositAPY_RAY: BigNumberish;
  lmAPY: number;
  lmRewardAll: Array<{ apy: number; token: string }>;
}

export interface UserPoolAggregatedStatsPayload {
  totalLMRewards: number;
  totalLiqInUSD: number;
  totalLiqt7DInUSD: number;
  totalLiqt10kBasis: number;
  user: string;
  pools: Array<UserPoolPayload>;
}
