import type { Address } from "viem";
import type { DelayedWithdrawCollateralIntent } from "../../../../../index.js";
import { BigIntMath } from "../../../../../utils/bigint-math.js";
import {
  type AccountCalculatorOperation,
  buildDecreaseDebtOperation,
  buildSwapOperation,
  buildWithdrawCollateralOperation,
} from "../../../operations/index.js";
import { convertAmount, eq } from "../../../utils/index.js";
import { claimedOutput, type ResumeContext } from "../types.js";

/**
 * Resume withdraw — `claim → (swap?) → decreaseDebt? → (unwrapRwa?) → withdraw`.
 *
 * The claim can land in any token the delayed leg happened to produce, while the
 * payout must be the market underlying (or its RWA asset), so the tail splits
 * the claim between two competing uses: the promised payout `W`, and the debt
 * the start leg deferred (`intent.debtRepaid`). The five branches below are that
 * split, by how the claimed token relates to the payout token and the
 * underlying; the payout is always served first, and the debt gets what is left,
 * so a routing shortfall shows up as leverage slightly above target rather than
 * as a payout the user was promised and did not get.
 */
export async function buildResumeWithdrawOperations(
  ctx: ResumeContext<DelayedWithdrawCollateralIntent>,
): Promise<AccountCalculatorOperation[]> {
  const { intent, creditAccount, sdk, push, paths, ledger } = ctx;
  const { underlying } = creditAccount;
  const claimed = claimedOutput(ctx);
  const rwaAsset = sdk.tokensMeta.rwaUnderlyings.get(underlying)?.asset;

  if (
    !eq(intent.withdrawToken, underlying) &&
    (rwaAsset == null || !eq(intent.withdrawToken, rwaAsset))
  ) {
    throw new Error("Withdraw intent should withdraw underlying token only");
  }

  const convert = convertAmount(sdk, creditAccount.creditManager);

  /** Routes `amountIn` of `tokenIn`, leaving the rest of its balance alone. */
  const swap = async (
    tokenIn: Address,
    amountIn: bigint,
    tokenOut: Address,
  ): Promise<bigint> => {
    if (amountIn <= 0n) {
      return 0n;
    }
    const leg = await paths.swap({
      tokenIn,
      tokenOut,
      amount: amountIn,
      keep: ledger.balanceOf(tokenIn) - amountIn,
    });
    push(
      buildSwapOperation({
        tokenIn,
        amountIn,
        tokenOut,
        amountOut: leg.minAmount,
        calls: leg.calls,
      }),
    );
    return leg.minAmount;
  };

  const decreaseDebt = (amount: bigint): void => {
    if (amount > 0n) {
      push(buildDecreaseDebtOperation({ amount, creditAccount, sdk }));
    }
  };

  const withdraw = async (amount: bigint) =>
    push(
      ...(await buildWithdrawCollateralOperation({
        token: intent.withdrawToken,
        amount,
        to: intent.to,
        underlying,
        creditAccount,
        sdk,
      })),
    );

  // 2.2.x — the start leg already repaid the debt, so the whole claim is payout.
  if (intent.debtRepaid === 0n) {
    const available = eq(claimed.token, intent.withdrawToken)
      ? claimed.amount
      : await swap(claimed.token, claimed.amount, intent.withdrawToken);
    return withdraw(BigIntMath.min(intent.withdrawAmount, available));
  }

  // 2.5.x — source and payout token coincide, which only happens when the source
  // itself was the delayed asset: the payout is already on the account, so the
  // claim exists purely to repay.
  if (eq(intent.sourceToken, intent.withdrawToken)) {
    const raised = eq(claimed.token, underlying)
      ? claimed.amount
      : await swap(claimed.token, claimed.amount, underlying);
    decreaseDebt(BigIntMath.min(raised, intent.debtRepaid));
    return withdraw(intent.withdrawAmount);
  }

  // 2.3.x — payout is the underlying, so both uses want the same token: convert
  // everything, reserve the payout, repay from the remainder.
  if (eq(intent.withdrawToken, underlying)) {
    const raised = eq(claimed.token, underlying)
      ? claimed.amount
      : await swap(claimed.token, claimed.amount, underlying);
    const payout = BigIntMath.min(intent.withdrawAmount, raised);
    decreaseDebt(BigIntMath.min(raised - payout, intent.debtRepaid));
    return withdraw(payout);
  }

  // 2.4.2 — the claim is already the payout token: hand over what is owed and
  // route only the surplus into debt.
  if (eq(claimed.token, intent.withdrawToken)) {
    const payout = BigIntMath.min(intent.withdrawAmount, claimed.amount);
    const raised = await swap(
      claimed.token,
      claimed.amount - payout,
      underlying,
    );
    decreaseDebt(BigIntMath.min(raised, intent.debtRepaid));
    return withdraw(payout);
  }

  // 2.4.1 — the claim is the underlying: repay from it directly, then buy the
  // payout token with the part reserved for it.
  if (eq(claimed.token, underlying)) {
    const reserved = BigIntMath.min(
      convert(intent.withdrawToken, claimed.token, intent.withdrawAmount),
      claimed.amount,
    );
    decreaseDebt(BigIntMath.min(claimed.amount - reserved, intent.debtRepaid));
    const bought = await swap(claimed.token, reserved, intent.withdrawToken);
    return withdraw(BigIntMath.min(intent.withdrawAmount, bought));
  }

  // 2.4.3 — a third token: two independent legs out of one claim.
  const reserved = BigIntMath.min(
    convert(intent.withdrawToken, claimed.token, intent.withdrawAmount),
    claimed.amount,
  );
  const raised = await swap(
    claimed.token,
    claimed.amount - reserved,
    underlying,
  );
  decreaseDebt(BigIntMath.min(raised, intent.debtRepaid));
  const bought = await swap(claimed.token, reserved, intent.withdrawToken);
  return withdraw(BigIntMath.min(intent.withdrawAmount, bought));
}
