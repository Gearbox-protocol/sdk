import type {
  MultiCall,
  OnchainSDK,
  RequestableWithdrawal,
} from "../../../../index.js";
import type { CreditAccountSlice } from "../../types.js";

export interface StartDelayedWithdrawalOperation {
  type: "startDelayedWithdrawal";
  token: RequestableWithdrawal["token"];
  amountIn: bigint;
  outputs: RequestableWithdrawal["outputs"];
  settlement: "instant" | "delayed";
  calls: MultiCall[];
}

export function buildStartDelayedWithdrawalOperation(input: {
  preview: RequestableWithdrawal;
  settlement: "instant" | "delayed";
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
}): StartDelayedWithdrawalOperation {
  return {
    type: "startDelayedWithdrawal",
    token: input.preview.token,
    amountIn: input.preview.amountIn,
    outputs: [...input.preview.outputs],
    settlement: input.settlement,
    calls: input.sdk.accounts.assembleStartDelayedWithdrawalCalls({
      creditFacade: input.creditAccount.creditFacade,
      preview: input.preview,
    }),
  };
}
