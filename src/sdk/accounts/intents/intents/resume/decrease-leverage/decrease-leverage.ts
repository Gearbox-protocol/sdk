import {
  type AccountCalculatorOperation,
  buildDecreaseDebtOperation,
  buildSwapOperation,
  buildWrapRwaCollateralOperation,
} from "../../../operations/index.js";
import { eq, toTargetDecimals } from "../../../utils/index.js";
import { claimedOutput, type ResumeContext } from "../types.js";

/**
 * Resume decrease-leverage — `claim → (wrapRwa | swap)? → decreaseDebt`.
 *
 * Everything claimed funds the repayment, since the whole point of the delayed
 * leg was to raise underlying with which to shrink the debt. The conversion is a
 * 1:1 wrap when the claim landed in the market's RWA asset, and a routed swap
 * otherwise.
 */
export async function buildResumeDecreaseLeverageOperations(
  ctx: ResumeContext,
): Promise<AccountCalculatorOperation[]> {
  const { creditAccount, sdk, push, paths } = ctx;
  const { underlying } = creditAccount;
  const claimed = claimedOutput(ctx);

  if (eq(claimed.token, underlying)) {
    return push(
      buildDecreaseDebtOperation({
        amount: claimed.amount,
        creditAccount,
        sdk,
      }),
    );
  }

  const rwaAsset = sdk.tokensMeta.rwaUnderlyings.get(underlying)?.asset;

  if (rwaAsset != null && eq(claimed.token, rwaAsset)) {
    const amountOut = toTargetDecimals(
      claimed.amount,
      claimed.token,
      underlying,
      sdk,
    );

    push(
      await buildWrapRwaCollateralOperation({
        tokenIn: claimed.token,
        amountIn: claimed.amount,
        tokenOut: underlying,
        amountOut,
        creditAccount,
        sdk,
      }),
    );

    return push(
      buildDecreaseDebtOperation({ amount: amountOut, creditAccount, sdk }),
    );
  }

  const leg = await paths.swap({
    tokenIn: claimed.token,
    tokenOut: underlying,
    amount: claimed.amount,
    keep: ctx.ledger.balanceOf(claimed.token) - claimed.amount,
  });

  push(
    buildSwapOperation({
      tokenIn: claimed.token,
      amountIn: claimed.amount,
      tokenOut: underlying,
      amountOut: leg.minAmount,
      calls: leg.calls,
    }),
  );

  return push(
    buildDecreaseDebtOperation({
      amount: leg.minAmount,
      creditAccount,
      sdk,
    }),
  );
}
