import type { Address } from "viem";
import type { OnchainSDK, RouterCASlice } from "../../../../index.js";
import type { CloseQuote } from "../../quoters/index.js";

export interface CloseCreditAccountOperation extends CloseQuote {
  type: "closeCreditAccount";
}

export async function buildCloseCreditAccountOperation(
  input: {
    quote: CloseQuote;
    sdk: OnchainSDK;
  },
  option:
    | {
        kind: "offchain";
      }
    | {
        kind: "onchain";
        to: Address;
        creditAccount: RouterCASlice;
      },
): Promise<CloseCreditAccountOperation> {
  const { quote } = input;

  if (option.kind === "onchain") {
    const rwaConfig = input.sdk.tokensMeta.rwaUnderlyings.get(
      option.creditAccount.underlying,
    );

    const closeCalls = await input.sdk.accounts.assembleCloseCreditAccountCalls(
      {
        creditAccount: option.creditAccount,
        routerCalls: quote.calls,
        assetsToWithdraw: [
          (
            rwaConfig?.asset ?? option.creditAccount.underlying
          ).toLowerCase() as Address,
        ],
        to: option.to,
      },
    );

    return { ...quote, calls: closeCalls, type: "closeCreditAccount" };
  }

  return { ...quote, calls: [], type: "closeCreditAccount" };
}
