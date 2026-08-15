import type { Address } from "viem";
import { BigIntMath } from "../../../../../utils/bigint-math.js";
import {
  type AccountCalculatorOperation,
  buildDecreaseDebtOperation,
  buildSwapOperation,
  buildWithdrawCollateralOperation,
} from "../../../operations/index.js";
import {
  convertAmount,
  createRouterPaths,
  eq,
  pickFattestNonPhantomToken,
  type RouterPaths,
} from "../../../utils/index.js";
import { accountCollateral, assertDebtInRange } from "../common.js";
import {
  balanceOf,
  IntentPreviewError,
  type StartIntentProps,
  type WithdrawStrategyIntent,
} from "../types.js";

type Props = StartIntentProps & { intent: WithdrawStrategyIntent };

/**
 * Intent 2.1 — partial withdraw at fixed leverage.
 *
 * Five shapes, driven by whether the source `S` and the payout token `T` are the
 * underlying `U`:
 *
 * | S    | T    | Operations                                                |
 * | ---- | ---- | --------------------------------------------------------- |
 * | U    | U    | `decreaseDebt → withdraw`                                  |
 * | U    | Any  | `decreaseDebt → swap(U→T) → withdraw`                       |
 * | Any  | U    | `swap(S→U) → decreaseDebt → withdraw`                       |
 * | Any  | S    | `swap(S→U) → decreaseDebt → withdraw(S)`                    |
 * | Any1 | Any2 | `swap(S→U) → decreaseDebt → swap(S→T) → withdraw`           |
 *
 * When `S` is already the underlying no routing is needed to repay. When `T` is
 * the underlying both legs land in the same token and a single swap covers them.
 */
export async function buildWithdrawOperations(
  props: Props,
): Promise<Array<AccountCalculatorOperation>> {
  const { intent, creditAccount, sdk, slippage = 0 } = props;
  const { underlying } = creditAccount;

  if (intent.amount <= 0n) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      "withdraw: amount must be positive",
    );
  }

  const convert = convertAmount(sdk, creditAccount.creditManager);
  const tokenOut = intent.tokenOut ?? underlying;
  const source = resolveSourceToken(props);

  // Value leaving the account as payout, priced in the underlying.
  const payoutInUnderlying = eq(tokenOut, underlying)
    ? intent.amount
    : convert(tokenOut, underlying, intent.amount);
  if (payoutInUnderlying <= 0n) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      `withdraw: cannot price ${intent.amount} of ${tokenOut}`,
    );
  }

  const collateral = accountCollateral(creditAccount, sdk);
  if (payoutInUnderlying >= collateral) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      `withdraw: ${payoutInUnderlying} exceeds withdrawable collateral ${collateral}`,
    );
  }

  // Fixed leverage: debt shrinks in the same proportion as collateral.
  const repay =
    collateral > 0n
      ? (creditAccount.accountDebt * payoutInUnderlying) / collateral
      : 0n;
  assertDebtInRange(creditAccount.accountDebt - repay, creditAccount, sdk);

  const paths = createRouterPaths({ sdk, creditAccount, slippage });
  const ctx = {
    props,
    tokenOut,
    source,
    payoutInUnderlying,
    repay,
    paths,
    convert,
  };

  return eq(source, underlying)
    ? fromUnderlying(ctx)
    : fromCollateralToken(ctx);
}

interface Ctx {
  props: Props;
  tokenOut: Address;
  source: Address;
  payoutInUnderlying: bigint;
  repay: bigint;
  paths: RouterPaths;
  convert: (from: Address, to: Address, amount: bigint) => bigint;
}

/** Source is the underlying: repay straight away, route only the payout. */
async function fromUnderlying(
  ctx: Ctx,
): Promise<Array<AccountCalculatorOperation>> {
  const { props, tokenOut, payoutInUnderlying, repay, paths } = ctx;
  const { creditAccount, sdk, intent } = props;
  const { underlying } = creditAccount;

  const available = balanceOf(creditAccount, underlying);
  const needed = payoutInUnderlying + repay;
  if (available < needed) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      `withdraw: needs ${needed} underlying, account holds ${available}`,
    );
  }

  const operations: Array<AccountCalculatorOperation> = [];
  pushDecreaseDebt(operations, repay, props);

  if (eq(tokenOut, underlying)) {
    operations.push(
      ...(await buildWithdrawCollateralOperation({
        token: underlying,
        amount: intent.amount,
        to: intent.to,
        underlying,
        creditAccount,
        sdk,
      })),
    );
    return operations;
  }

  const leg = await paths.swap({
    tokenIn: underlying,
    tokenOut,
    amount: payoutInUnderlying,
    keep: available - needed,
  });

  operations.push(
    buildSwapOperation({
      tokenIn: underlying,
      amountIn: payoutInUnderlying,
      tokenOut,
      amountOut: leg.minAmount,
      calls: leg.calls,
    }),
    ...(await buildWithdrawCollateralOperation({
      token: tokenOut,
      amount: leg.minAmount,
      to: intent.to,
      underlying,
      creditAccount,
      sdk,
    })),
  );

  return operations;
}

/** Source is a collateral token: it has to be routed before anything can settle. */
async function fromCollateralToken(
  ctx: Ctx,
): Promise<Array<AccountCalculatorOperation>> {
  const { props, tokenOut, source, payoutInUnderlying, repay, paths, convert } =
    ctx;
  const { creditAccount, sdk, intent } = props;
  const { underlying } = creditAccount;

  const available = balanceOf(creditAccount, source);

  // Payout token is the underlying: both legs land in it, so one swap covers
  // the payout and the repayment together.
  if (eq(tokenOut, underlying)) {
    const spend = convert(underlying, source, payoutInUnderlying + repay);
    assertSourceCovers(spend, available, source);

    const leg = await paths.swap({
      tokenIn: source,
      tokenOut: underlying,
      amount: spend,
      keep: available - spend,
    });

    const operations: Array<AccountCalculatorOperation> = [
      buildSwapOperation({
        tokenIn: source,
        amountIn: spend,
        tokenOut: underlying,
        amountOut: leg.minAmount,
        calls: leg.calls,
      }),
    ];

    // The payout is fixed, so any routing shortfall is absorbed by repaying less.
    pushDecreaseDebt(
      operations,
      BigIntMath.max(0n, leg.minAmount - intent.amount),
      props,
    );
    operations.push(
      ...(await buildWithdrawCollateralOperation({
        token: underlying,
        amount: intent.amount,
        to: intent.to,
        underlying,
        creditAccount,
        sdk,
      })),
    );

    return operations;
  }

  // Payout token differs from the underlying, so the repayment needs its own leg.
  const spendForDebt = repay > 0n ? convert(underlying, source, repay) : 0n;
  const payoutFromSource = eq(tokenOut, source);
  const spendForPayout = payoutFromSource
    ? intent.amount
    : convert(underlying, source, payoutInUnderlying);

  assertSourceCovers(spendForDebt + spendForPayout, available, source);

  const operations: Array<AccountCalculatorOperation> = [];

  if (spendForDebt > 0n) {
    const debtLeg = await paths.swap({
      tokenIn: source,
      tokenOut: underlying,
      amount: spendForDebt,
      keep: available - spendForDebt,
    });
    operations.push(
      buildSwapOperation({
        tokenIn: source,
        amountIn: spendForDebt,
        tokenOut: underlying,
        amountOut: debtLeg.minAmount,
        calls: debtLeg.calls,
      }),
    );
    pushDecreaseDebt(operations, debtLeg.minAmount, props);
  }

  // Source already is the payout token: hand it over untouched.
  if (payoutFromSource) {
    operations.push(
      ...(await buildWithdrawCollateralOperation({
        token: source,
        amount: intent.amount,
        to: intent.to,
        underlying,
        creditAccount,
        sdk,
      })),
    );
    return operations;
  }

  const payoutLeg = await paths.swap({
    tokenIn: source,
    tokenOut,
    amount: spendForPayout,
    keep: available - spendForDebt - spendForPayout,
  });

  operations.push(
    buildSwapOperation({
      tokenIn: source,
      amountIn: spendForPayout,
      tokenOut,
      amountOut: payoutLeg.minAmount,
      calls: payoutLeg.calls,
    }),
    ...(await buildWithdrawCollateralOperation({
      token: tokenOut,
      amount: payoutLeg.minAmount,
      to: intent.to,
      underlying,
      creditAccount,
      sdk,
    })),
  );

  return operations;
}

function pushDecreaseDebt(
  operations: Array<AccountCalculatorOperation>,
  amount: bigint,
  props: Props,
): void {
  if (amount <= 0n) {
    return;
  }
  operations.push(
    buildDecreaseDebtOperation({
      amount,
      creditAccount: props.creditAccount,
      sdk: props.sdk,
    }),
  );
}

function assertSourceCovers(
  spend: bigint,
  available: bigint,
  source: Address,
): void {
  if (spend <= 0n || available < spend) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      `withdraw: needs ${spend} of ${source}, account holds ${available}`,
    );
  }
}

/** Source to liquidate; the fattest non-phantom balance by default. */
function resolveSourceToken(props: Props): Address {
  const { intent, creditAccount, sdk } = props;
  if (intent.sourceToken) {
    return intent.sourceToken;
  }

  const pick = pickFattestNonPhantomToken({ creditAccount, sdk });
  if (!pick) {
    throw new IntentPreviewError(
      "insufficientSourceBalance",
      "withdraw: account has no spendable balance",
    );
  }
  return pick.token;
}
