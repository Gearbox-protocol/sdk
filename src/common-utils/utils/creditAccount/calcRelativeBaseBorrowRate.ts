export interface CalcRelativeBaseBorrowRateProps {
  debt: bigint;
  baseRateWithFee: number;
  assetAmountInUnderlying: bigint;
}

export function calcRelativeBaseBorrowRate({
  debt,
  baseRateWithFee,
  assetAmountInUnderlying,
}: CalcRelativeBaseBorrowRateProps) {
  return debt * BigInt(baseRateWithFee) * assetAmountInUnderlying;
}
