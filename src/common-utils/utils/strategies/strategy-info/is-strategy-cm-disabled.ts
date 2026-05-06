import type { CreditManagerSlice, QuotaSlice } from "./types.js";

export function isStrategyCMDisabled(
  cm: Pick<CreditManagerSlice, "availableToBorrow" | "minDebt">,
  quota: Pick<QuotaSlice, "isActive" | "limit" | "totalQuoted"> | undefined,
): boolean {
  if (!quota) return true;

  const realLimit = quota.isActive ? quota.limit : 0n;
  const quotaLeft = realLimit - quota.totalQuoted;

  return cm.availableToBorrow < cm.minDebt || quotaLeft < cm.minDebt;
}
