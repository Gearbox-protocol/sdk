import { calcTimeToLiquidationMs } from "../../../sdk/positions/calcTimeToLiquidationMs.js";

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
 *
 * @deprecated Use `calcTimeToLiquidationMs` from `sdk/positions` instead;
 * this wrapper only forwards to the new implementation.
 */
export function getTimeToLiquidation({
  healthFactor,
  totalBorrowRate_debt,
}: TimeToLiquidationProps) {
  return calcTimeToLiquidationMs(healthFactor, totalBorrowRate_debt);
}
