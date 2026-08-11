import type { MultiCall, OnchainSDK } from "../../../../index.js";
import type { CreditAccountSlice } from "../../types.js";
import type { OperationBuilderOption } from "../types.js";

export interface DecreaseDebtOperation {
  type: "decreaseDebt";
  amount: bigint;
  calls: MultiCall[];
}

export function buildDecreaseDebtOperation(
  input: { amount: bigint; creditAccount: CreditAccountSlice; sdk: OnchainSDK },
  option: OperationBuilderOption,
): DecreaseDebtOperation {
  const calls =
    option.kind === "onchain"
      ? [
          input.sdk.accounts.prepareChangeDebt(
            input.creditAccount.creditFacade,
            input.amount,
            true,
          ),
        ]
      : [];

  return {
    type: "decreaseDebt",
    amount: input.amount,
    calls,
  };
}
