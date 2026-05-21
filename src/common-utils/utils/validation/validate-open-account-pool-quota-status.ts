import type { Address } from "viem";
import type { CreditManagerSlice } from "../strategies/strategy-info/types.js";

export interface ValidateOpenAccountPoolQuotaStatusResult {
  message: "insufficientQuota";
  token: Address;
}

export function validateOpenAccountPoolQuotaStatus(
  targetToken: Address,
  creditManager: Pick<CreditManagerSlice, "quotas">,
  amountToBorrow: bigint,
): ValidateOpenAccountPoolQuotaStatusResult | null {
  const quota = creditManager.quotas[targetToken];

  if (quota) {
    const realLimit = quota.isActive ? quota.limit : 0n;
    const quotaLeft = realLimit - quota.totalQuoted;

    if (quotaLeft < amountToBorrow)
      return { message: "insufficientQuota", token: targetToken };
  }

  return null;
}
