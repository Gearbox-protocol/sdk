import type { MultiCall, OnchainSDK } from "../../../../index.js";
import type { CreditAccountSlice } from "../../types.js";

export interface DecreaseDebtOperation {
  type: "decreaseDebt";
  amount: bigint;
  calls: MultiCall[];
}

export function buildDecreaseDebtOperation(input: {
  amount: bigint;
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
}): DecreaseDebtOperation {
  return {
    type: "decreaseDebt",
    amount: input.amount,
    calls: [
      input.sdk.accounts.prepareChangeDebt(
        input.creditAccount.creditFacade,
        input.amount,
        true,
      ),
    ],
  };
}
