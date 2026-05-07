import { PERCENTAGE_FACTOR, toBigInt } from "../../../sdk/index.js";

/**
 * Adds fee interest to a rate
 * @param rate
 * @param feeInterest = in PERCENTAGE_FACTOR
 * @returns
 */
export function getRateWithFee(
  rate: number | bigint,
  feeInterest: number,
): bigint {
  return (
    (toBigInt(rate) * (BigInt(feeInterest) + PERCENTAGE_FACTOR)) /
    PERCENTAGE_FACTOR
  );
}
