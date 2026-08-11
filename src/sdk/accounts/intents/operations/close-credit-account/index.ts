import type { Address } from "viem";
import type { OnchainSDK, RouterCASlice } from "../../../../index.js";
import type { CloseQuote } from "../../quoters/index.js";

export interface CloseCreditAccountOperation extends CloseQuote {
  type: "closeCreditAccount";
}

export async function buildCloseCreditAccountOperation(
  quote: CloseQuote,
  option:
    | {
        kind: "offchain";
        to?: Address;
        creditAccount?: RouterCASlice;
        sdk?: OnchainSDK;
      }
    | {
        kind: "onchain";
        to: Address;
        creditAccount: RouterCASlice;
        sdk: OnchainSDK;
      },
): Promise<CloseCreditAccountOperation> {
  if (option.kind === "onchain") {
    const rwaConfig = option.sdk.tokensMeta.rwaUnderlyings.get(
      option.creditAccount.underlying,
    );

    const closeCalls =
      await option.sdk.accounts.assembleCloseCreditAccountCalls({
        creditAccount: option.creditAccount,
        routerCalls: quote.calls,
        assetsToWithdraw: [
          (
            rwaConfig?.asset ?? option.creditAccount.underlying
          ).toLowerCase() as Address,
        ],
        to: option.to,
      });

    return { ...quote, calls: closeCalls, type: "closeCreditAccount" };
  }

  return { ...quote, type: "closeCreditAccount" };
}
