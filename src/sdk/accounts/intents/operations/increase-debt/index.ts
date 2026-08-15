import type { MultiCall, OnchainSDK } from "../../../../index.js";
import type { CreditAccountSlice } from "../../types.js";

export interface IncreaseDebtOperation {
  type: "increaseDebt";
  amount: bigint;
  calls: MultiCall[];
}

export function buildIncreaseDebtOperation(input: {
  amount: bigint;
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
}): IncreaseDebtOperation {
  return {
    type: "increaseDebt",
    amount: input.amount,
    calls: [
      input.sdk.accounts.prepareIncreaseDebt(
        input.creditAccount.creditFacade,
        input.amount,
      ),
    ],
  };
}
