import type { Address } from "viem";
import type {
  DelayedWithdrawCollateralIntent,
  OnchainSDK,
} from "../../../../../index.js";
import { BigIntMath } from "../../../../../index.js";
import {
  type AccountCalculatorOperation,
  buildClaimDelayedWithdrawalOperation,
  buildDecreaseDebtOperation,
  buildSwapOperation,
  buildWithdrawCollateralOperation,
  type ClaimDelayedOption,
  primaryInstantOutput,
} from "../../../operations/index.js";
import type { SwapQuote, SwapQuoter } from "../../../quoters/index.js";
import type { CreditAccountSlice } from "../../../types.js";
import { convertAmount, eq, simulateState } from "../../../utils/index.js";

const ZERO_QUOTE: SwapQuote = {
  amount: 0n,
  minAmount: 0n,
  calls: [],
};

/**
 * Resume withdraw — linear op chain following the W-first matrix:
 * claim → (swap?) → decreaseDebt? → (unwrapRwa?) → withdrawCollateral.
 * Only the underlying token (or the unwrapped rwa.asset on RWA markets) can
 * be withdrawn (enforced below).
 * The delayed lean intent records debt already paid at start; only its
 * residual `debtRepaid` may consume claimed proceeds.
 *
 * Matrix arithmetic (split sizing) is oracle-priced; emitted swap legs go
 * through the given quoter (`amountOut` on the op, `minAmountOut` caps the
 * debt repay funded by the leg). Mirrors legacy
 * `buildWithdrawResumeLogicalOps` + `resolveSwapBranches` (simplified: no
 * min/avg op branches).
 */
export async function buildResumeWithdrawOperations(
  props: {
    intent: DelayedWithdrawCollateralIntent;
    options: ClaimDelayedOption;
    creditAccount: CreditAccountSlice;
    sdk: OnchainSDK;
    quotaReserve: number | undefined;
  },
  quoter: SwapQuoter,
): Promise<AccountCalculatorOperation[]> {
  const { intent, options, creditAccount, sdk } = props;
  const underlying = creditAccount.underlying;
  const rwaMeta = sdk.tokensMeta.rwaUnderlyings.get(underlying);

  if (
    !eq(intent.withdrawToken, underlying) &&
    !eq(intent.withdrawToken, rwaMeta?.asset ?? ("" as Address))
  ) {
    throw new Error("Withdraw intent should withdraw underlying token only");
  }

  const claimOp = buildClaimDelayedWithdrawalOperation(
    creditAccount,
    options,
    sdk,
  );
  const primary = primaryInstantOutput(claimOp.outputs);

  if (!primary || primary.amount <= 0n) {
    throw new Error("No claimable assets");
  }

  const convert = convertAmount(sdk, creditAccount.creditManager);

  const operations: Array<AccountCalculatorOperation> = [claimOp];

  const swap = async (
    tokenIn: Address,
    amountIn: bigint,
    tokenOut: Address,
  ): Promise<SwapQuote> => {
    if (amountIn <= 0n) {
      return ZERO_QUOTE;
    }

    const { state } = simulateState({
      operations,
      creditAccount,
      sdk,
      quotaReserve: props.quotaReserve,
    });
    const tokenInBalance =
      state.assets.find(asset => eq(asset.token, tokenIn))?.balance ?? 0n;
    const quote = await quoter({
      from: [{ token: tokenIn, balance: amountIn }],
      tokenOut,
      tokenInBalance,
    });
    operations.push(
      buildSwapOperation({
        tokenIn,
        amountIn,
        tokenOut,
        amountOut: quote.minAmount,
        calls: quote.calls,
      }),
    );
    return quote;
  };

  const decreaseDebt = (amount: bigint): void => {
    if (amount > 0n) {
      operations.push(buildDecreaseDebtOperation(amount));
    }
  };

  const withdrawCollateral = async (amount: bigint) => {
    const withdrawOperations = await buildWithdrawCollateralOperation({
      token: intent.withdrawToken,
      amount,
      to: intent.to,
      underlying,
      sdk,
      creditAccount,
      kind: options.kind,
    });
    operations.push(...withdrawOperations);
  };

  if (intent.debtRepaid === 0n) {
    /**
     * 2.2.x: debtRepaid === 0n means that debt was repayed on withdrawal start,
     * So all claimed amount should be withdrawn
     */
    const available = eq(primary.token, intent.withdrawToken)
      ? primary.amount
      : (await swap(primary.token, primary.amount, intent.withdrawToken))
          .minAmount;
    await withdrawCollateral(BigIntMath.min(intent.withdrawAmount, available));
  } else if (eq(intent.sourceToken, intent.withdrawToken)) {
    /**
     * 2.5.x: This can happen when source=target and source has delayedConfig.
     * In this case claimed amount should be used only to repay debt
     * and withdrawAmount can be withdrawn as is
     */
    const undQuote = eq(primary.token, underlying)
      ? ({
          ...ZERO_QUOTE,
          amount: primary.amount,
          minAmount: primary.amount,
        } satisfies SwapQuote)
      : await swap(primary.token, primary.amount, underlying);
    decreaseDebt(BigIntMath.min(undQuote.minAmount, intent.debtRepaid));
    await withdrawCollateral(intent.withdrawAmount);
  } else if (eq(intent.withdrawToken, underlying)) {
    /**
     * 2.3.x: Special case - withdrawToken = underlying,
     * so the full claim amount can be swapped int underlying;
     * reserve W from the U result, then repay from the remainder.
     */
    const undQuote = eq(primary.token, underlying)
      ? ({
          ...ZERO_QUOTE,
          amount: primary.amount,
          minAmount: primary.amount,
        } satisfies SwapQuote)
      : await swap(primary.token, primary.amount, underlying);
    const withdrawn = BigIntMath.min(intent.withdrawAmount, undQuote.minAmount);
    decreaseDebt(
      BigIntMath.min(
        BigIntMath.max(undQuote.minAmount - withdrawn, 0n),
        intent.debtRepaid,
      ),
    );
    withdrawCollateral(withdrawn);
  } else if (eq(primary.token, intent.withdrawToken)) {
    /**
     * 2.4.2: Special case - withdrawToken = claimedToken,
     * so we can take part of claimed amount without conversion and swap the rest into underlying;
     * reserve claimed T for W; only the remainder funds debt.
     */
    const withdrawn = BigIntMath.min(intent.withdrawAmount, primary.amount);
    const undQuote = await swap(
      primary.token,
      primary.amount - withdrawn,
      underlying,
    );
    decreaseDebt(BigIntMath.min(undQuote.minAmount, intent.debtRepaid));
    withdrawCollateral(withdrawn);
  } else if (eq(primary.token, underlying)) {
    /**
     * 2.4.1: Special case - underlying = claimedToken,
     * so we can decrease debt using part of claimed amount and swap the rest into target;
     * reserve U equivalent of W, repay with the rest, then swap W.
     */
    const withdrawInUnderlying = BigIntMath.min(
      convert(intent.withdrawToken, primary.token, intent.withdrawAmount),
      primary.amount,
    );
    decreaseDebt(
      BigIntMath.min(primary.amount - withdrawInUnderlying, intent.debtRepaid),
    );
    const withdrawQuote = await swap(
      primary.token,
      withdrawInUnderlying,
      intent.withdrawToken,
    );
    withdrawCollateral(
      BigIntMath.min(intent.withdrawAmount, withdrawQuote.minAmount),
    );
  } else {
    /**
     * 2.4.3: Common case - both target and claimed token are independent tokens;
     * Here we should reserve part of claimed amount for withdrawal and
     * use the rest for debt repayment.
     * split a third-token claim into independent debt and W legs.
     */
    const withdrawInClaim = BigIntMath.min(
      convert(intent.withdrawToken, primary.token, intent.withdrawAmount),
      primary.amount,
    );

    const debtQuote = await swap(
      primary.token,
      BigIntMath.max(primary.amount - withdrawInClaim, 0n),
      underlying,
    );
    decreaseDebt(BigIntMath.min(debtQuote.minAmount, intent.debtRepaid));
    const withdrawQuote = await swap(
      primary.token,
      withdrawInClaim,
      intent.withdrawToken,
    );
    withdrawCollateral(
      BigIntMath.min(intent.withdrawAmount, withdrawQuote.minAmount),
    );
  }

  return operations;
}
