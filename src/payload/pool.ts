import { BigNumberish } from "ethers";

import { PoolDataStruct } from "../types/@gearbox-protocol/core-v2/contracts/interfaces/IDataCompressor.sol/IDataCompressor";
import { ExcludeArrayProps } from "../utils/types";

export type PoolDataPayload = ExcludeArrayProps<PoolDataStruct>;

export interface ChartsPoolDataPayload {
  addr: string;
  underlyingToken: string;
  dieselToken: string;
  isWETH: boolean;
  expectedLiquidity: string;
  expectedLiquidityLimit: string;
  availableLiquidity: string;
  totalBorrowed: string;
  depositAPY_RAY: string;
  borrowAPY_RAY: string;
  dieselRate_RAY: string;
  withdrawFee: number;

  lmAPY: number;

  // v2 props
  underlying: string;
  linearCumulativeIndex: BigNumberish;
  cumulativeIndex_RAY: BigNumberish;
  timestampLU: BigNumberish;
  version: number;

  expectedLiquidityInUSD: number;
  expectedLiquidityLimitInUSD: number;
  availableLiquidityInUSD: number;
  totalBorrowedInUSD: number;
  uniqueLPs: number;
  dieselAPY7D?: number;
  dieselAPY30D?: number;

  addLiqCount: number;
  addedLiquidity: number;
  caLockedValue: number;
  caLockedValueInUSD: number;
  earned7D: number;
  earned7DInUSD: number;
  expectedLiqWeekAgo: number;
  removeLiqCount: number;
  removedLiquidity: number;
}

export interface ChartsAggregatedStats {
  uniqueLPs: number;
  earned7D: number;
}

export interface ChartsAggregatedPoolPayload extends ChartsAggregatedStats {
  pools: Array<ChartsPoolDataPayload>;
}
