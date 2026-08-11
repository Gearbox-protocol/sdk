import type { Address } from "viem";
import type { calcQuotaUpdate } from "../../../../../common-utils/index.js";
import type { Asset } from "../../../../index.js";

export interface QuotaUpdateOperation {
  type: "changeQuota";
  desiredQuota: Record<Address, Asset>;
  quotaIncrease: Asset[];
  quotaDecrease: Asset[];
}

export type QuotaUpdateState = ReturnType<typeof calcQuotaUpdate>;

export function buildQuotaUpdateOperation(
  update: QuotaUpdateState,
): QuotaUpdateOperation {
  return {
    type: "changeQuota" as const,
    desiredQuota: update.desiredQuota,
    quotaIncrease: update.quotaIncrease,
    quotaDecrease: update.quotaDecrease,
  };
}
