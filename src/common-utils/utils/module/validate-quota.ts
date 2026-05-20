import type { Asset } from "@gearbox-protocol/sdk";
import type { Address } from "viem";
import type { CreditManagerData } from "./types.js";

export interface ValidateQuotaProps {
  desiredQuota: Record<Address, Asset>;
  quotaUpdate: Array<Asset>;
  creditManager: Pick<CreditManagerData, "quotas" | "maxEnabledTokensLength">;
  throwOnZeroQuotaUpdate?: boolean;
}

export type ValidateQuotaResult =
  | {
      message: "maxQuotasLengthReached";
      count: number;
      max: number;
    }
  | { message: "quotaShouldBeUpdated" }
  | { message: "insufficientQuota"; token: Address };

export function validateQuota(
  props: ValidateQuotaProps,
): ValidateQuotaResult | null {
  const desiredQuotasList = Object.values(props.desiredQuota).filter(
    a => a.balance > 0n,
  );

  if (desiredQuotasList.length > props.creditManager.maxEnabledTokensLength)
    return {
      message: "maxQuotasLengthReached",
      count: desiredQuotasList.length,
      max: props.creditManager.maxEnabledTokensLength,
    };

  if (props.quotaUpdate.length === 0 && props.throwOnZeroQuotaUpdate)
    return { message: "quotaShouldBeUpdated" };

  for (const { token, balance: updateBy } of props.quotaUpdate) {
    const quota = props.creditManager.quotas[token];

    if (updateBy > 0 && quota) {
      const realLimit = quota.isActive ? quota.limit : 0n;
      const quotaLeft = realLimit - quota.totalQuoted;

      if (quotaLeft < updateBy) return { message: "insufficientQuota", token };
    }
  }

  return null;
}
