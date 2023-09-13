import { BigNumberish } from "ethers";

import {
  LinearModelStructOutput,
  PoolDataStructOutput,
} from "../types-v3/IDataCompressorV3_00";
import { ExcludeArrayProps } from "../utils/types";

export type PoolDataPayload = ExcludeArrayProps<PoolDataStructOutput>;

export type LinearModelStruct = ExcludeArrayProps<LinearModelStructOutput>;

export interface ChartsPoolDataPayload {
  addr: string;
  dieselToken: string;
  underlyingToken: string;
  isWETH: boolean;

  borrowAPY_RAY: BigNumberish;
  depositAPY_RAY: BigNumberish;
  dieselRate_RAY: BigNumberish;
  lmAPY: number;

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
}

export interface UserPoolAggregatedStatsPayload {
  totalLMRewards: number;
  totalLiqInUSD: number;
  totalLiqt7DInUSD: number;
  totalLiqt10kBasis: number;
  user: string;
  pools: Array<UserPoolPayload>;
}
