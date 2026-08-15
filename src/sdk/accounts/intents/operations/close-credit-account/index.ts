import type { Address } from "viem";
import type {
  MultiCall,
  OnchainSDK,
  RouterCASlice,
} from "../../../../index.js";

export interface CloseCreditAccountOperation {
  type: "closeCreditAccount";
  /** Underlying the account holds once every balance is converted. */
  underlyingBalance: bigint;
  /** Expected proceeds of the conversion. */
  amount: bigint;
  /** Floor proceeds after slippage. */
  minAmount: bigint;
  calls: MultiCall[];
}

export async function buildCloseCreditAccountOperation(input: {
  leg: { amount: bigint; minAmount: bigint; calls: MultiCall[] };
  underlyingBalance: bigint;
  to: Address;
  creditAccount: RouterCASlice;
  sdk: OnchainSDK;
}): Promise<CloseCreditAccountOperation> {
  const { leg, creditAccount, sdk } = input;

  const rwaConfig = sdk.tokensMeta.rwaUnderlyings.get(creditAccount.underlying);

  return {
    type: "closeCreditAccount",
    underlyingBalance: input.underlyingBalance,
    amount: leg.amount,
    minAmount: leg.minAmount,
    calls: await sdk.accounts.assembleCloseCreditAccountCalls({
      creditAccount,
      routerCalls: leg.calls,
      assetsToWithdraw: [
        (rwaConfig?.asset ?? creditAccount.underlying).toLowerCase() as Address,
      ],
      to: input.to,
    }),
  };
}
