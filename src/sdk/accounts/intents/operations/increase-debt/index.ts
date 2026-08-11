import type { MultiCall, OnchainSDK } from "../../../../index.js";
import type { CreditAccountSlice } from "../../types.js";
import type { OperationBuilderOption } from "../types.js";

export interface IncreaseDebtOperation {
  type: "increaseDebt";
  amount: bigint;
  calls: MultiCall[];
}

export function buildIncreaseDebtOperation(
  input: { amount: bigint; creditAccount: CreditAccountSlice; sdk: OnchainSDK },
  option: OperationBuilderOption,
): IncreaseDebtOperation {
  const calls =
    option.kind === "onchain"
      ? [
          input.sdk.accounts.prepareIncreaseDebt(
            input.creditAccount.creditFacade,
            input.amount,
          ),
        ]
      : [];

  return {
    type: "increaseDebt",
    amount: input.amount,
    calls,
  };
}
