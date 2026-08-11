import type { Address } from "viem";
import type { OnchainSDK } from "../../../../index.js";
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
  /**
   * Wallet recipient for withdrawn tokens — never a token address.
   * Set when known; may be undefined for disconnected preview (no assemble).
   */
  to?: Address;
}

/**
 * Partial-withdraw tail: RWA forced unwrap, then withdrawCollateral to wallet.
 *
 * When withdrawing the wrapped RWA underlying, forces unwrap to `rwa.asset`
 * and withdraws the unwrapped asset instead — even if the intent asked for
 * underlying (mirrors legacy `resolveRwaForcedUnwrapWithdraw`).
 */
export async function buildWithdrawCollateralOperation(args: {
  token: Address;
  amount: bigint;
  to: Address | undefined;
  underlying: Address;
  sdk: OnchainSDK;
  creditAccount: CreditAccountSlice;
  kind: "onchain" | "offchain";
}): Promise<
  | [WithdrawCollateralOperation]
  | [UnwrapRwaCollateralOperation, WithdrawCollateralOperation]
> {
  const { token, amount, to, underlying, sdk, kind, creditAccount } = args;
  if (amount <= 0n) {
    throw new Error("Nothing to withdraw");
  }

  const rwa = eq(token, underlying)
    ? sdk.tokensMeta.rwaUnderlyings.get(underlying)
    : undefined;

  if (!rwa) {
    return [{ type: "withdrawCollateral", token, amount, to }];
  }

  const amountOut = toTargetDecimals(amount, underlying, rwa.asset, sdk);

  return [
    await buildUnwrapRwaCollateralOperation(
      {
        amountIn: amount,
        tokenIn: underlying,
        tokenOut: rwa.asset,
        amountOut,
      },
      {
        kind,
        sdk,
        creditAccount,
      },
    ),
    { type: "withdrawCollateral", token: rwa.asset, amount: amountOut, to },
  ];
}
