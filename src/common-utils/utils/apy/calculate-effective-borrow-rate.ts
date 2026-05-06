import type { Address } from "viem";

export function calculateEffectiveBorrowRate({
  underlyingTokenAddress,
  baseRateWithFee = 0,
  apyList,
}: {
  underlyingTokenAddress: Address | undefined;
  baseRateWithFee?: number;
  apyList: Record<Address, number> | undefined;
}): number {
  const apy = underlyingTokenAddress
    ? apyList?.[underlyingTokenAddress] || 0
    : 0;

  return apy > 0 ? baseRateWithFee + apy : baseRateWithFee;
}
