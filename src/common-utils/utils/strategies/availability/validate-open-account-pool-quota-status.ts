import type { Address } from "viem";

import type { CreditManagerSlice } from "../strategy-info/types.js";

export function validateOpenAccountPoolQuotaStatus(
  targetToken: Address,
  creditManager: CreditManagerSlice,
  amountToBorrow: bigint,
) {
  const quota = creditManager.quotas[targetToken];

  if (quota) {
    const realLimit = quota.isActive ? quota.limit : 0n;
    const quotaLeft = realLimit - quota.totalQuoted;

    if (quotaLeft < amountToBorrow)
      return {
        message: "insufficientQuota",
        token: targetToken,
      } as const;
  }

  return null;
}
