import { type Asset, type AssetsMap, MIN_INT96 } from "../../sdk/index.js";

export interface ApplyQuotaChangesResult {
  /**
   * Final non-zero per-token quotas.
   */
  quotas: Asset[];
  /**
   * Applied (post-clamp) per-token deltas, non-zero entries only.
   */
  quotasChange: Asset[];
}

/**
 * Applies raw `updateQuota` changes to the account's initial quotas.
 *
 * Each change is applied sequentially: `MIN_INT96` disables the quota, other
 * changes are added to the running quota with the result clamped at zero
 * (quotas cannot go negative on-chain).
 *
 * @param initialQuotas - Per-token quotas before the operation.
 * @param changes - Raw changes recorded by `applyInnerOperations`.
 * @returns `quotas` - final non-zero per-token quotas; `quotasChange` -
 * applied (post-clamp) per-token deltas, non-zero entries only.
 */
export function applyQuotaChanges(
  initialQuotas: AssetsMap,
  changes: Asset[],
): ApplyQuotaChangesResult {
  const final = initialQuotas.clone();
  for (const { token, balance: change } of changes) {
    if (change === MIN_INT96) {
      final.upsert(token, 0n);
    } else {
      const next = final.getOrZero(token) + change;
      final.upsert(token, next > 0n ? next : 0n);
    }
  }

  return {
    quotas: final.toAssets(0n),
    quotasChange: final.difference(initialQuotas).toAssets(),
  };
}
