import type { Address } from "viem";
import type { MultiCall, OnchainSDK } from "../../../../index.js";
import type { CreditAccountSlice } from "../../types.js";
import { eq, toTargetDecimals } from "../../utils/index.js";
import {
  buildUnwrapRwaCollateralOperation,
  type UnwrapRwaCollateralOperation,
} from "../unwrap-rwa-collateral/index.js";

export interface WithdrawCollateralOperation {
  type: "withdrawCollateral";
  token: Address;
  amount: bigint;
  /** Wallet recipient for withdrawn tokens — never a token address. */
  to: Address;
  calls: MultiCall[];
}

/**
 * Partial-withdraw tail: RWA forced unwrap, then withdrawCollateral to wallet.
 *
 * When withdrawing the wrapped RWA underlying, forces unwrap to `rwa.asset`
 * and withdraws the unwrapped asset instead — even if the intent asked for
 * underlying (mirrors legacy `resolveRwaForcedUnwrapWithdraw`).
 */
export async function buildWithdrawCollateralOperation(input: {
  token: Address;
  amount: bigint;
  to: Address;
  underlying: Address;
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
}): Promise<
  | [WithdrawCollateralOperation]
  | [UnwrapRwaCollateralOperation, WithdrawCollateralOperation]
> {
  const { token, amount, to, underlying, creditAccount, sdk } = input;
  if (amount <= 0n) {
    throw new Error("Nothing to withdraw");
  }

  const buildWithdraw = (
    withdrawToken: Address,
    withdrawAmount: bigint,
  ): WithdrawCollateralOperation => ({
    type: "withdrawCollateral",
    token: withdrawToken,
    amount: withdrawAmount,
    to,
    calls: [
      sdk.accounts.prepareWithdrawToken(
        creditAccount.creditFacade,
        withdrawToken,
        withdrawAmount,
        to,
      ),
    ],
  });

  const rwa = eq(token, underlying)
    ? sdk.tokensMeta.rwaUnderlyings.get(underlying)
    : undefined;

  if (!rwa) {
    return [buildWithdraw(token, amount)];
  }

  const amountOut = toTargetDecimals(amount, underlying, rwa.asset, sdk);

  return [
    await buildUnwrapRwaCollateralOperation({
      amountIn: amount,
      tokenIn: underlying,
      tokenOut: rwa.asset,
      amountOut,
      creditAccount,
      sdk,
    }),
    buildWithdraw(rwa.asset, amountOut),
  ];
}
