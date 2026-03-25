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
 * Calculates the time remaining until liquidation for a credit account.
 * @returns The time remaining until liquidation in milliseconds.
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
