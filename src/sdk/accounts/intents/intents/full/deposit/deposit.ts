import type { Address } from "viem";
import {
  type AccountCalculatorOperation,
  buildAddCollateralOperation,
  buildIncreaseDebtOperation,
  buildSwapOperation,
  buildUnwrapRwaCollateralOperation,
  buildWrapRwaCollateralOperation,
} from "../../../operations/index.js";
import {
  createRouterPaths,
  eq,
  pickFattestNonPhantomToken,
  toTargetDecimals,
} from "../../../utils/index.js";
import {
  accountCollateral,
  assertDebtInRange,
  debtForLeverage,
} from "../common.js";
import {
  balanceOf,
  type DepositStrategyIntent,
  IntentPreviewError,
  type StartIntentProps,
} from "../types.js";

/**
 * Intents 1.1 / 1.2 — deposit into a strategy.
 *
 * ```
 * addCollateral(C) → [wrap C → underlying, RWA only]
 *   → increaseDebt(dD) → convert(underlying → T)
 * ```
 *
 * The chain is linear because only the underlying (or its unwrapped RWA form) may
 * be deposited, so after normalisation there is a single token to convert: the
 * deposited amount plus everything just borrowed.
 */
export async function buildDepositOperations(
  props: StartIntentProps & { intent: DepositStrategyIntent },
): Promise<Array<AccountCalculatorOperation>> {
  const { intent, creditAccount, sdk, slippage = 0 } = props;
  const { underlying } = creditAccount;

  if (intent.amount <= 0n) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      "deposit: amount must be positive",
    );
  }

  const rwa = sdk.tokensMeta.rwaUnderlyings.get(underlying);
  const isUnderlying = eq(intent.token, underlying);
  const isRwaAsset = !!rwa && eq(intent.token, rwa.asset);

  if (!isUnderlying && !isRwaAsset) {
    throw new IntentPreviewError(
      "unsupportedCollateralToken",
      `deposit: only ${underlying}${rwa ? ` or ${rwa.asset}` : ""} can be deposited, got ${intent.token}`,
    );
  }

  // Everything downstream is denominated in the underlying.
  const depositedInUnderlying = isUnderlying
    ? intent.amount
    : toTargetDecimals(intent.amount, intent.token, underlying, sdk);

  const debtDelta = resolveDebtDelta(props, depositedInUnderlying);
  assertDebtInRange(creditAccount.accountDebt + debtDelta, creditAccount, sdk);

  const positionToken = resolvePositionToken(props);

  const operations: Array<AccountCalculatorOperation> = [
    buildAddCollateralOperation({
      token: intent.token,
      amount: intent.amount,
      value: intent.value,
      creditAccount,
      sdk,
    }),
  ];

  // The deposited asset is already the position token: leave it alone and only
  // convert what gets borrowed.
  const collateralIsPosition = eq(intent.token, positionToken);

  if (isRwaAsset && !collateralIsPosition) {
    operations.push(
      await buildWrapRwaCollateralOperation({
        tokenIn: intent.token,
        amountIn: intent.amount,
        tokenOut: underlying,
        amountOut: depositedInUnderlying,
        creditAccount,
        sdk,
      }),
    );
  }

  if (debtDelta > 0n) {
    operations.push(
      buildIncreaseDebtOperation({ amount: debtDelta, creditAccount, sdk }),
    );
  }

  // Underlying awaiting conversion: the borrowed part, plus the deposit unless
  // it was left as the position token.
  const toConvert =
    debtDelta + (collateralIsPosition ? 0n : depositedInUnderlying);

  if (toConvert <= 0n || eq(positionToken, underlying)) {
    return operations;
  }

  if (rwa && eq(positionToken, rwa.asset)) {
    operations.push(
      await buildUnwrapRwaCollateralOperation({
        tokenIn: underlying,
        amountIn: toConvert,
        tokenOut: rwa.asset,
        amountOut: toTargetDecimals(toConvert, underlying, rwa.asset, sdk),
        creditAccount,
        sdk,
      }),
    );
    return operations;
  }

  const leg = await createRouterPaths({ sdk, creditAccount, slippage }).swap({
    tokenIn: underlying,
    tokenOut: positionToken,
    amount: toConvert,
    // Underlying already held is existing collateral, not deposit proceeds.
    keep: balanceOf(creditAccount, underlying),
  });

  operations.push(
    buildSwapOperation({
      tokenIn: underlying,
      amountIn: toConvert,
      tokenOut: positionToken,
      amountOut: leg.minAmount,
      calls: leg.calls,
    }),
  );

  return operations;
}

/**
 * Extra debt to draw against the enlarged collateral.
 *
 * Without a target leverage the ratio is preserved exactly — `dD = D0 * a / C0`
 * — which avoids the rounding you would get from recovering the current leverage
 * first and re-applying it.
 */
function resolveDebtDelta(
  props: StartIntentProps & { intent: DepositStrategyIntent },
  depositedInUnderlying: bigint,
): bigint {
  const { intent, creditAccount, sdk } = props;
  const collateral = accountCollateral(creditAccount, sdk);

  if (intent.targetLeverage === undefined) {
    if (collateral <= 0n) {
      throw new IntentPreviewError(
        "insufficientSourceBalance",
        "deposit: cannot preserve leverage on an account with no collateral",
      );
    }
    return (creditAccount.accountDebt * depositedInUnderlying) / collateral;
  }

  const target = debtForLeverage(
    collateral + depositedInUnderlying,
    intent.targetLeverage,
  );
  const delta = target - creditAccount.accountDebt;
  if (delta < 0n) {
    throw new IntentPreviewError(
      "leverageOutOfRange",
      `deposit: target leverage ${intent.targetLeverage} would require repaying debt`,
    );
  }
  return delta;
}

/** Position token to convert into; the fattest non-underlying balance by default. */
function resolvePositionToken(
  props: StartIntentProps & { intent: DepositStrategyIntent },
): Address {
  const { intent, creditAccount, sdk } = props;
  if (intent.positionToken) {
    return intent.positionToken;
  }

  const pick = pickFattestNonPhantomToken({
    creditAccount,
    sdk,
    exclude: [creditAccount.underlying],
  });
  if (!pick) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      "deposit: no position token on the account",
    );
  }
  return pick.token;
}
