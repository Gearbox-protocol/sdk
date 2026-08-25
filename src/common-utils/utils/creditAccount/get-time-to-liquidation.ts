import { calcTimeToLiquidationMs } from "../../../onchain/positions/calcTimeToLiquidationMs.js";

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
 * @param props Current health factor and `totalBorrowRate_debt`, both `Bps`
 * (`10000` = 100%) — not the legacy `PERCENTAGE_FACTOR_1KK` (`1_000_000` =
 * 100%) scale the pre-rewrite frontend fed this under the same name.
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
