import type { Bps } from "../../model/index.js";
import { PERCENTAGE_FACTOR, SECONDS_PER_YEAR } from "../constants/math.js";

/**
 * Estimated milliseconds until `healthFactorBps` decays to `10000` (1.0)
 * while the debt grows at `totalBorrowRateOnDebt`, in the same `Bps` scale
 * (`10000` = 100%) as {@link BorrowRateBreakdown.totalOnDebt} reports it —
 * not the legacy `PERCENTAGE_FACTOR_1KK` (`1_000_000` = 100%) scale the
 * pre-rewrite frontend fed into its own `getTimeToLiquidation`.
 *
 * `null` when the account is already at or under the liquidation threshold,
 * or when the debt carries no borrow rate at all.
 **/
export function calcTimeToLiquidationMs(
  healthFactorBps: Bps,
  totalBorrowRateOnDebt: bigint,
): bigint | null {
  if (
    BigInt(healthFactorBps) <= PERCENTAGE_FACTOR ||
    totalBorrowRateOnDebt === 0n
  ) {
    return null;
  }

  // (HF - 1) / (br_D / year) or (HF - 1) * (year / br_D)
  const HF_1 = BigInt(healthFactorBps) - PERCENTAGE_FACTOR;
  const brPerYear =
    (BigInt(SECONDS_PER_YEAR) * PERCENTAGE_FACTOR) / totalBorrowRateOnDebt;
  return (HF_1 * brPerYear * 1000n) / PERCENTAGE_FACTOR;
}
