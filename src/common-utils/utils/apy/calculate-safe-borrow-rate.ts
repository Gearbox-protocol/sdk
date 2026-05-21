import {
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
} from "../../../sdk/constants/math.js";
import { BigIntMath } from "../../utils/bigint-math.js";
import type {
  CreditManagerSlice,
  PoolSlice,
} from "../strategies/strategy-info/types.js";
import { calculateBorrowRateFromUtilization } from "./calculate-borrow-rate-from-utilization.js";
export interface CalculateBorrowRateSafelyProps {
  pool: PoolSlice;
  creditManager: CreditManagerSlice;

  expectedLiquidityChange?: bigint;
  availableLiquidityChange?: bigint;
}

/**
 * Returns borrow rate multiplied by feeInterest
 */
export function calculateSafeBorrowRate({
  pool,
  creditManager,

  expectedLiquidityChange = 0n,
  availableLiquidityChange = 0n,
}: CalculateBorrowRateSafelyProps) {
  const expectedLiquidity = pool.expectedLiquidity + expectedLiquidityChange;
  const availableLiquidity = pool.availableLiquidity + availableLiquidityChange;

  const borrowed = BigIntMath.max(expectedLiquidity - availableLiquidity, 0n);

  const EXTRA_PRECISION = 100n;
  const ONE = PERCENTAGE_FACTOR * EXTRA_PRECISION;
  const utilization = BigIntMath.min(
    expectedLiquidity > 0 ? (borrowed * ONE) / expectedLiquidity : 0n,
    ONE,
  );

  const rate = calculateBorrowRateFromUtilization(
    utilization,
    pool.interestModel,
    EXTRA_PRECISION,
  );

  const rateWithDaoFee = Number(
    (rate * (BigInt(creditManager.feeInterest) + PERCENTAGE_FACTOR)) /
      PERCENTAGE_DECIMALS /
      EXTRA_PRECISION,
  );

  return rateWithDaoFee;
}
