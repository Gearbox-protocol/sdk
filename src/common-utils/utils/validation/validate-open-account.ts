import type { Address } from "viem";
import type { Asset } from "../../../sdk/index.js";
import type { CreditManagerSlice } from "../strategies/strategy-info/types.js";
import type { ValidateQuotaResult } from "./validate-quota.js";
import { validateQuota } from "./validate-quota.js";
export interface ValidateOpenAccountProps {
  debt: bigint;
  creditManager: Pick<
    CreditManagerSlice,
    | "minDebt"
    | "maxDebt"
    | "underlyingToken"
    | "quotas"
    | "maxEnabledTokensLength"
  >;
  desiredQuota: Record<Address, Asset>;
  quotaUpdate: Array<Asset>;
  loading?: boolean;
}

export type ValidateOpenAccountResult =
  | { message: "loading" }
  | { message: "amountLessMin"; amount: bigint }
  | { message: "debtGreaterMax"; amount: bigint }
  | ValidateQuotaResult;

export function validateOpenAccount(
  props: ValidateOpenAccountProps,
): ValidateOpenAccountResult | null {
  const { debt, creditManager, loading } = props;

  if (loading) {
    return { message: "loading" };
  }

  if (debt < creditManager.minDebt) {
    return { message: "amountLessMin", amount: creditManager.minDebt };
  }
  if (debt > creditManager.maxDebt) {
    return { message: "debtGreaterMax", amount: creditManager.maxDebt };
  }

  return validateQuota(props);
}
