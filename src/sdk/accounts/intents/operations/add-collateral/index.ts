import type { Address } from "viem";
import type { MultiCall, OnchainSDK } from "../../../../index.js";
import type { CreditAccountSlice } from "../../types.js";

export interface AddCollateralOperation {
  type: "addCollateral";
  token: Address;
  amount: bigint;
  value?: bigint;
  calls: MultiCall[];
}

export function buildAddCollateralOperation(input: {
  token: Address;
  amount: bigint;
  value?: bigint;
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
}): AddCollateralOperation {
  return {
    type: "addCollateral",
    token: input.token,
    amount: input.amount,
    value: input.value,
    calls: input.sdk.accounts.prepareAddCollateral(
      input.creditAccount.creditFacade,
      [{ token: input.token, balance: input.amount }],
      {},
    ),
  };
}
