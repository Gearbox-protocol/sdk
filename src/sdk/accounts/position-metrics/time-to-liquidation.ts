import type { Bps } from "../../../model/index.js";
import {
  PERCENTAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  SECONDS_PER_YEAR,
} from "../../constants/math.js";
import type { OnchainSDK } from "../../index.js";
import { borrowRate } from "./borrow-rate.js";
import { healthFactor } from "./health-factor.js";
import type { AccountSnapshot } from "./types.js";

/**
 * Estimated milliseconds until an account state's health factor decays to
 * `10000` (1.0) under its current borrow rate, assuming linear debt growth.
 *
 * `null` when the account is already at or under the liquidation threshold,
 * or when the debt carries no borrow rate at all.
 *
 * @param sdk - Market data source.
 * @param snapshot - Account state to evaluate.
 **/
export function timeToLiquidation(
  sdk: OnchainSDK,
  snapshot: AccountSnapshot,
): bigint | null {
  return timeToLiquidationMs(
    healthFactor(sdk, snapshot),
    BigInt(borrowRate(sdk, snapshot).totalOnDebt),
  );
}

/**
 * The pure core of {@link timeToLiquidation}: milliseconds until
 * `healthFactorBps` decays to `10000` while the debt grows at
 * `totalBorrowRateOnDebt` (basis points relative to the debt, as
 * {@link BorrowRateBreakdown.totalOnDebt} reports it). Formula is in parity
 * with the legacy `getTimeToLiquidation`.
 **/
export function timeToLiquidationMs(
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
    (BigInt(SECONDS_PER_YEAR) * PERCENTAGE_FACTOR * PERCENTAGE_DECIMALS) /
    totalBorrowRateOnDebt;
  return (HF_1 * brPerYear * 1000n) / PERCENTAGE_FACTOR;
}
