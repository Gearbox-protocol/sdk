import type {
  DelayedDecreaseLeverageIntent,
  OnchainSDK,
} from "../../../../../index.js";
import {
  type AccountCalculatorOperation,
  buildClaimDelayedWithdrawalOperation,
  buildDecreaseDebtOperation,
  buildSwapOperation,
  buildWrapRwaCollateralOperation,
  type ClaimDelayedOption,
  primaryInstantOutput,
} from "../../../operations/index.js";
import type { SwapQuoter } from "../../../quoters/index.js";
import type { CreditAccountSlice } from "../../../types.js";
import { eq, simulateState, toTargetDecimals } from "../../../utils/index.js";

/**
 * Resume decrease-leverage — linear op chain:
 * claim → (wrapRwa | swap)? → decreaseDebt.
 * All claimed proceeds fund debt repay (legacy
 * `buildDecreaseLeverageResumeLogicalOps` + `buildResumeRepayFromClaimOps`).
 * Conversion legs go through the given quoter; wrap is 1:1 decimals rescale.
 */
export async function buildResumeDecreaseLeverageOperations(
  props: {
    intent: DelayedDecreaseLeverageIntent;
    options: ClaimDelayedOption;
    creditAccount: CreditAccountSlice;
    sdk: OnchainSDK;
    quotaReserve: number | undefined;
  },
  quoter: SwapQuoter,
): Promise<AccountCalculatorOperation[]> {
  const { options, creditAccount, sdk } = props;
  const underlying = creditAccount.underlying;
  const rwaMeta = sdk.tokensMeta.rwaUnderlyings.get(underlying);

  const claimOp = buildClaimDelayedWithdrawalOperation(
    { creditAccount, sdk },
    options,
  );
  const primary = primaryInstantOutput(claimOp.outputs);

  if (!primary || primary.amount <= 0n) {
    throw new Error("No claimable assets");
  }

  const operations: Array<AccountCalculatorOperation> = [claimOp];

  const decreaseDebt = (amount: bigint): void => {
    if (amount > 0n) {
      operations.push(
        buildDecreaseDebtOperation({ amount, creditAccount, sdk }, options),
      );
    }
  };

  if (eq(primary.token, underlying)) {
    decreaseDebt(primary.amount);
    return operations;
  }

  const rwaAsset = rwaMeta?.asset;
  if (rwaAsset != null && eq(primary.token, rwaAsset)) {
    const amountOut = toTargetDecimals(
      primary.amount,
      primary.token,
      underlying,
      sdk,
    );

    operations.push(
      await buildWrapRwaCollateralOperation(
        {
          tokenIn: primary.token,
          amountIn: primary.amount,
          tokenOut: underlying,
          amountOut,
          creditAccount,
          sdk,
        },
        options,
      ),
    );

    decreaseDebt(amountOut);
    return operations;
  } else {
    const { state } = simulateState({
      operations,
      creditAccount,
      sdk,
      quotaReserve: props.quotaReserve,
    });
    const tokenInBalance =
      state.assets.find(asset => eq(asset.token, primary.token))?.balance ?? 0n;

    const quote = await quoter({
      from: [{ token: primary.token, balance: primary.amount }],
      tokenOut: underlying,
      tokenInBalance,
    });

    operations.push(
      buildSwapOperation(
        {
          tokenIn: primary.token,
          amountIn: primary.amount,
          tokenOut: underlying,
          amountOut: quote.minAmount,
          calls: quote.calls,
          creditAccount,
          sdk,
        },
        options,
      ),
    );
    decreaseDebt(quote.minAmount);

    return operations;
  }
}
