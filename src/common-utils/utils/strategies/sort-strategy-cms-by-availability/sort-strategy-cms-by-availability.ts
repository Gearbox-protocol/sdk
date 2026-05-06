import type { Address } from "viem";

import { amountAbcComparator } from "../../creditAccount/sort.js";
import {
  type APYListSlice,
  type CreditManagerSlice,
  cmAvailabilityCondition,
  getStrategyMaxAPY,
  type PoolSlice,
} from "../strategy-info/index.js";

export interface SortStrategyCMsByAvailabilityProps {
  targetToken: Address;
  allCreditManagers: Array<CreditManagerSlice>;
  apyListByNetwork: Record<number, APYListSlice | undefined> | undefined;
  pools: Record<Address, PoolSlice> | undefined | null;
  slippage: number;
  quotaReserve: number;
  leverageLimit: number | undefined;
  isStrategy: boolean;
}

export function sortStrategyCMsByAvailability({
  targetToken,
  allCreditManagers,
  apyListByNetwork,
  pools,
  slippage,
  quotaReserve,
  leverageLimit,
  isStrategy,
}: SortStrategyCMsByAvailabilityProps): Array<CreditManagerSlice> {
  const list = [...allCreditManagers].sort((cmA, cmB) => {
    // check if min debt is available (ca is openable)
    const sort = cmAvailabilityCondition(targetToken, cmA, cmB, pools);
    if (sort !== 0) return sort;

    const apyA = getStrategyMaxAPY(
      targetToken,
      cmA,
      apyListByNetwork,
      slippage,
      quotaReserve,
      leverageLimit,
    );

    const apyB = getStrategyMaxAPY(
      targetToken,
      cmB,
      apyListByNetwork,
      slippage,
      quotaReserve,
      leverageLimit,
    );

    const sortAPY = isStrategy
      ? (apyB?.totalMaxApy || 0) - (apyA?.totalMaxApy || 0)
      : (apyA?.totalBorrowRate || 0) - (apyB?.totalBorrowRate || 0);
    if (sortAPY !== 0) return sortAPY;

    return amountAbcComparator(cmA.maxDebt, cmB.maxDebt);
  });

  return list;
}
