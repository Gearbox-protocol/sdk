import type { CreditManagerSlice, QuotaSlice } from "./types.js";

export function isStrategyCMDisabled(
  cm: CreditManagerSlice,
  quota: QuotaSlice | undefined,
): boolean {
  if (!quota) return true;

  const realLimit = quota.isActive ? quota.limit : 0n;
  const quotaLeft = realLimit - quota.totalQuoted;

  return cm.availableToBorrow < cm.minDebt || quotaLeft < cm.minDebt;
}
