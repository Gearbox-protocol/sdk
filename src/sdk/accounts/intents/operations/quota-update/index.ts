import type { Address } from "viem";
import type { calcQuotaUpdate } from "../../../../../common-utils/utils/creditAccount/quota-utils.js";
import type { Asset, MultiCall, OnchainSDK } from "../../../../index.js";
import type { CreditAccountSlice } from "../../types.js";
import type { OperationBuilderOption } from "../types.js";

export interface QuotaUpdateOperation {
  type: "changeQuota";
  desiredQuota: Record<Address, Asset>;
  quotaIncrease: Asset[];
  quotaDecrease: Asset[];
  calls: MultiCall[];
}

export type QuotaUpdateState = ReturnType<typeof calcQuotaUpdate>;

export function buildQuotaUpdateOperation(
  input: {
    update: QuotaUpdateState;
    creditAccount: CreditAccountSlice;
    sdk: OnchainSDK;
  },
  option: OperationBuilderOption,
): QuotaUpdateOperation {
  const { update, creditAccount, sdk } = input;
  let calls: MultiCall[] = [];
  if (option.kind === "onchain") {
    const quotaAssets = [...update.quotaIncrease, ...update.quotaDecrease];
    if (quotaAssets.length > 0) {
      calls = sdk.accounts.prepareUpdateQuotas(creditAccount.creditFacade, {
        averageQuota: quotaAssets,
        minQuota: quotaAssets,
      });
    }
  }

  return {
    type: "changeQuota",
    desiredQuota: update.desiredQuota,
    quotaIncrease: update.quotaIncrease,
    quotaDecrease: update.quotaDecrease,
    calls,
  };
}
