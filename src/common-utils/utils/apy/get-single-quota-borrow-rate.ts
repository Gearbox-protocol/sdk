import type { CalcQuotaBorrowRateProps } from "../creditAccount/calc-quota-borrow-rate.js";
import { calcQuotaBorrowRate } from "../creditAccount/calc-quota-borrow-rate.js";

import { getRateWithFee } from "./get-rate-with-fee.js";

export interface GetSingleQuotaBorrowRateRate extends CalcQuotaBorrowRateProps {
  feeInterest: number;
}

/**
 * Under the hood sums up rates for all given quotas and then multiplies them by 1+feeInterest,
 * but it is expected that the ONLY quota will be passed
 */
export function getSingleQuotaBorrowRate(
  props: GetSingleQuotaBorrowRateRate,
): bigint {
  const qr = calcQuotaBorrowRate(props);
  return getRateWithFee(qr, props.feeInterest);
}
