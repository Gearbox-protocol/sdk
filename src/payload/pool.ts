import { PoolDataStruct } from "../types/@gearbox-protocol/core-v2/contracts/interfaces/IDataCompressor.sol/IDataCompressor";
import { ExcludeArrayProps } from "../utils/types";

export type PoolDataPayload = ExcludeArrayProps<PoolDataStruct>;

export interface ChartsPoolDataPayload {
  addr: string;
  dieselToken: string;
  underlyingToken: string;
  isWETH: boolean;

  borrowAPY_RAY: string;
  depositAPY_RAY: string;
  dieselRate_RAY: string;
  lmAPY: number;

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

  dieselAPY1D: number;
  dieselAPY1D10kBasis: number;
  dieselAPY7D: number;
  dieselAPY30D: number;

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
