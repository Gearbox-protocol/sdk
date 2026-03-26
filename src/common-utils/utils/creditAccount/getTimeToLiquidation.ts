import {
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  SECONDS_PER_YEAR,
} from "../../../sdk/index.js";

export interface TimeToLiquidationProps {
  totalBorrowRate_debt: bigint;
  healthFactor: number;
}

/**
 * Estimates time remaining until health factor reaches liquidation level.
 *
 * Assumes linear debt growth under current aggregate borrow-rate exposure
 * and returns a millisecond duration until `healthFactor` decays to `1.0`
 * (`PERCENTAGE_FACTOR` in internal scale).
 *
 * @param props Current health factor and `totalBorrowRate * debt` term.
 * @returns Milliseconds to liquidation as `bigint`, or `null` when already at/under
 * liquidation threshold or when borrow-rate exposure is zero.
 */
export function getTimeToLiquidation({
  healthFactor,
  totalBorrowRate_debt,
}: TimeToLiquidationProps) {
  if (healthFactor <= PERCENTAGE_FACTOR || totalBorrowRate_debt === 0n)
    return null;

  // (HF - 1) / (br_D / year) or (HF - 1) * (year / br_D)
  const HF_1 = BigInt(healthFactor) - PERCENTAGE_FACTOR;
  const brPerYear =
    (BigInt(SECONDS_PER_YEAR) * PERCENTAGE_FACTOR * PERCENTAGE_DECIMALS) /
    totalBorrowRate_debt;
  return (HF_1 * brPerYear * 1000n) / PERCENTAGE_FACTOR;
}
