export interface CalcRelativeBaseBorrowRateProps {
  debt: bigint;
  baseRateWithFee: number;
  assetAmountInUnderlying: bigint;
}

/**
 * Computes base borrow-rate impact relative to asset amount.
 *
 * This helper is used as an intermediate weighted term:
 * `debt * baseRateWithFee * assetAmountInUnderlying`.
 *
 * @param props Debt amount, base borrow rate (with fee), and normalized asset amount.
 * @returns Relative borrow-rate contribution in bigint arithmetic.
 */
export function calcRelativeBaseBorrowRate({
  debt,
  baseRateWithFee,
  assetAmountInUnderlying,
}: CalcRelativeBaseBorrowRateProps) {
  return debt * BigInt(baseRateWithFee) * assetAmountInUnderlying;
}
