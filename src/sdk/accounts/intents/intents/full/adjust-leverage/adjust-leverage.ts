import type { Address } from "viem";
import { LEVERAGE_DECIMALS } from "../../../../../constants/math.js";
import { BigIntMath } from "../../../../../utils/bigint-math.js";
import {
  type AccountCalculatorOperation,
  buildDecreaseDebtOperation,
  buildIncreaseDebtOperation,
  buildSwapOperation,
  buildUnwrapRwaCollateralOperation,
  buildWrapRwaCollateralOperation,
} from "../../../operations/index.js";
import {
  convertAmount,
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
  type AdjustLeverageIntent,
  balanceOf,
  IntentPreviewError,
  type StartIntentProps,
} from "../types.js";

/**
 * Intent 6 — move leverage while collateral stays fixed.
 *
 * Collateral (own funds) is the invariant, so the target leverage fully
 * determines the new debt: `D1 = C0 * (L1 - 1)`. Everything borrowed extra is
 * converted into the position token, and everything repaid is funded by selling
 * the position token.
 *
 * - increase: `increaseDebt(dD) → convert(underlying → T)`
 * - decrease: `convert(T → underlying) → decreaseDebt(dD)`
 *
 * `convert` is a router swap, except on an RWA market where `T` is the raw asset
 * and the leg is a 1:1 wrap / unwrap instead.
 */
export async function buildAdjustLeverageOperations(
  props: StartIntentProps & { intent: AdjustLeverageIntent },
): Promise<Array<AccountCalculatorOperation>> {
  const { intent, creditAccount, sdk, slippage = 0 } = props;

  if (intent.targetLeverage < LEVERAGE_DECIMALS) {
    throw new IntentPreviewError(
      "leverageOutOfRange",
      `adjustLeverage: target leverage ${intent.targetLeverage} is below 1x`,
    );
  }

  const collateral = accountCollateral(creditAccount, sdk);
  if (collateral <= 0n) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      "adjustLeverage: account has no collateral to lever",
    );
  }

  const targetDebt = debtForLeverage(collateral, intent.targetLeverage);
  assertDebtInRange(targetDebt, creditAccount, sdk);

  const delta = targetDebt - creditAccount.accountDebt;
  if (delta === 0n) {
    return [];
  }

  const positionToken = resolvePositionToken(props);

  return delta > 0n
    ? increaseLeverage({ ...props, delta, positionToken, slippage })
    : decreaseLeverage({ ...props, repay: -delta, positionToken, slippage });
}

/** Position token to work against; the fattest non-underlying balance by default. */
function resolvePositionToken(
  props: StartIntentProps & { intent: AdjustLeverageIntent },
): Address {
  const { intent, creditAccount, sdk } = props;
  if (intent.token) {
    return intent.token;
  }

  const pick = pickFattestNonPhantomToken({
    creditAccount,
    sdk,
    exclude: [creditAccount.underlying],
  });
  if (!pick) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      "adjustLeverage: no position token on the account",
    );
  }
  return pick.token;
}

async function increaseLeverage(
  props: StartIntentProps & {
    delta: bigint;
    positionToken: Address;
    slippage: number;
  },
): Promise<Array<AccountCalculatorOperation>> {
  const { creditAccount, sdk, delta, positionToken, slippage } = props;
  const { underlying } = creditAccount;

  const operations: Array<AccountCalculatorOperation> = [
    buildIncreaseDebtOperation({ amount: delta, creditAccount, sdk }),
  ];

  // Borrowing already lands the underlying on the account: nothing to convert.
  if (eq(positionToken, underlying)) {
    return operations;
  }

  const rwa = sdk.tokensMeta.rwaUnderlyings.get(underlying);
  if (rwa && eq(positionToken, rwa.asset)) {
    operations.push(
      await buildUnwrapRwaCollateralOperation({
        tokenIn: underlying,
        amountIn: delta,
        tokenOut: rwa.asset,
        amountOut: toTargetDecimals(delta, underlying, rwa.asset, sdk),
        creditAccount,
        sdk,
      }),
    );
    return operations;
  }

  const leg = await createRouterPaths({ sdk, creditAccount, slippage }).swap({
    tokenIn: underlying,
    tokenOut: positionToken,
    amount: delta,
    // Underlying sitting on the account is collateral, not swap input.
    keep: balanceOf(creditAccount, underlying),
  });

  operations.push(
    buildSwapOperation({
      tokenIn: underlying,
      amountIn: delta,
      tokenOut: positionToken,
      amountOut: leg.minAmount,
      calls: leg.calls,
    }),
  );

  return operations;
}

async function decreaseLeverage(
  props: StartIntentProps & {
    repay: bigint;
    positionToken: Address;
    slippage: number;
  },
): Promise<Array<AccountCalculatorOperation>> {
  const { creditAccount, sdk, repay, positionToken, slippage } = props;
  const { underlying } = creditAccount;

  const onAccount = balanceOf(creditAccount, underlying);
  const shortfall = repay - onAccount;

  // Idle underlying already covers the repayment.
  if (shortfall <= 0n) {
    return [buildDecreaseDebtOperation({ amount: repay, creditAccount, sdk })];
  }

  if (eq(positionToken, underlying)) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      `adjustLeverage: needs ${repay} underlying, account holds ${onAccount}`,
    );
  }

  const convert = convertAmount(sdk, creditAccount.creditManager);
  const available = balanceOf(creditAccount, positionToken);
  const rwa = sdk.tokensMeta.rwaUnderlyings.get(underlying);
  const isRwaLeg = !!rwa && eq(positionToken, rwa.asset);

  const spend = isRwaLeg
    ? toTargetDecimals(shortfall, underlying, positionToken, sdk)
    : convert(underlying, positionToken, shortfall);

  if (spend <= 0n || available < spend) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      `adjustLeverage: needs ${spend} of ${positionToken}, account holds ${available}`,
    );
  }

  if (isRwaLeg) {
    return [
      await buildWrapRwaCollateralOperation({
        tokenIn: positionToken,
        amountIn: spend,
        tokenOut: underlying,
        amountOut: shortfall,
        creditAccount,
        sdk,
      }),
      buildDecreaseDebtOperation({ amount: repay, creditAccount, sdk }),
    ];
  }

  const leg = await createRouterPaths({ sdk, creditAccount, slippage }).swap({
    tokenIn: positionToken,
    tokenOut: underlying,
    amount: spend,
    keep: available - spend,
  });

  // Never repay past the target: surplus output stays on the account as
  // collateral, a shortfall simply leaves leverage a touch above target.
  const repayAmount = BigIntMath.min(repay, onAccount + leg.minAmount);

  return [
    buildSwapOperation({
      tokenIn: positionToken,
      amountIn: spend,
      tokenOut: underlying,
      amountOut: leg.minAmount,
      calls: leg.calls,
    }),
    buildDecreaseDebtOperation({ amount: repayAmount, creditAccount, sdk }),
  ];
}
