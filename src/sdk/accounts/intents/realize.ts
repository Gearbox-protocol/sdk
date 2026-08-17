import type { Address } from "viem";
import type { MultiCall, OnchainSDK } from "../../index.js";
import {
  type AccountCalculatorOperation,
  buildAddCollateralOperation,
  buildDecreaseDebtOperation,
  buildIncreaseDebtOperation,
  buildQuotaUpdateOperation,
  buildSwapOperation,
  buildUnwrapRwaCollateralOperation,
  buildWithdrawCollateralOperation,
  buildWrapRwaCollateralOperation,
} from "./operations.js";
import type { Amount, Step } from "./plan.js";
import type { CreditAccountSlice, OperationState } from "./types.js";
import { IntentPreviewError } from "./types.js";
import { eq, toTargetDecimals } from "./utils/common.js";
import { convertAmount } from "./utils/convert-amount.js";
import { OperationLedger } from "./utils/ledger.js";
import { getQuotasForUpdate } from "./utils/quotas-for-update.js";
import { createRouterPaths } from "./utils/router-path.js";

export interface RealizeProps {
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
  /** Router slippage in PERCENTAGE_FORMAT (100% = 10_000). */
  slippage: number;
  /** Extra quota headroom in PERCENTAGE_FORMAT. */
  quotaReserve: number | undefined;
}

export interface Realized {
  operations: AccountCalculatorOperation[];
  state: OperationState;
  calls: MultiCall[];
}

/**
 * Turns a plan into operations: the one place that talks to the router, knows
 * how an RWA leg differs from a swap, and keeps the running balances.
 *
 * Steps are applied to a ledger as they are built, so every leg sees the
 * balances the previous ones left behind: a swap only spends what the plan
 * says and keeps the rest of its input token in place, a repayment never
 * exceeds the underlying actually raised. Once the walk is done the projected
 * balances yield the quota update and the reported state.
 */
export async function realize(
  steps: Step[],
  props: RealizeProps,
): Promise<Realized> {
  const { creditAccount, sdk, slippage, quotaReserve } = props;
  const { underlying } = creditAccount;
  const rwaAsset = sdk.tokensMeta.rwaUnderlyings.get(underlying)?.asset;
  const price = convertAmount(sdk, creditAccount.creditManager);
  const paths = createRouterPaths({ sdk, creditAccount, slippage });

  const ledger = new OperationLedger({
    initialAssets: creditAccount.tokens,
    underlying,
    debt: creditAccount.accountDebt,
    convert: price,
  });
  const operations: AccountCalculatorOperation[] = [];
  const push = (op: AccountCalculatorOperation): void => {
    operations.push(op);
    ledger.apply(op);
  };

  /** Output of the last convert, for `RAISED` amounts. */
  let raised = 0n;
  const amountOf = (a: Amount): bigint =>
    typeof a === "bigint" ? a : min(raised, a.max ?? raised);
  const assertHolds = (token: Address, amount: bigint, what: string): void => {
    const held = ledger.balanceOf(token);
    if (amount <= 0n || held < amount) {
      throw new IntentPreviewError(
        "insufficientSourceBalance",
        `${what}: needs ${amount} of ${token}, account holds ${held}`,
      );
    }
  };

  for (const step of steps) {
    switch (step.kind) {
      case "add":
        push(
          buildAddCollateralOperation({
            token: step.token,
            amount: step.amount,
            value: step.value,
            creditAccount,
            sdk,
          }),
        );
        break;

      case "borrow":
        push(
          buildIncreaseDebtOperation({
            amount: step.amount,
            creditAccount,
            sdk,
          }),
        );
        break;

      case "repay": {
        const amount = min(
          amountOf(step.amount),
          ledger.balanceOf(underlying) - (step.keep ?? 0n),
        );
        if (amount > 0n) {
          push(buildDecreaseDebtOperation({ amount, creditAccount, sdk }));
        }
        break;
      }

      case "convert": {
        const amount = amountOf(step.amount);
        if (amount <= 0n) {
          raised = 0n;
          break;
        }
        assertHolds(step.from, amount, "convert");
        if (eq(step.from, step.to)) {
          raised = amount;
          break;
        }
        const wrap =
          rwaAsset && eq(step.from, rwaAsset) && eq(step.to, underlying);
        const unwrap =
          rwaAsset && eq(step.from, underlying) && eq(step.to, rwaAsset);
        if (wrap || unwrap) {
          const amountOut = toTargetDecimals(amount, step.from, step.to, sdk);
          const build = wrap
            ? buildWrapRwaCollateralOperation
            : buildUnwrapRwaCollateralOperation;
          push(
            await build({
              tokenIn: step.from,
              amountIn: amount,
              tokenOut: step.to,
              amountOut,
              creditAccount,
              sdk,
            }),
          );
          raised = amountOut;
          break;
        }
        const leg = await paths.swap({
          tokenIn: step.from,
          tokenOut: step.to,
          amount,
          keep: ledger.balanceOf(step.from) - amount,
        });
        push(
          buildSwapOperation({
            tokenIn: step.from,
            amountIn: amount,
            tokenOut: step.to,
            amountOut: leg.minAmount,
            calls: leg.calls,
          }),
        );
        raised = leg.minAmount;
        break;
      }

      case "withdraw": {
        const amount = amountOf(step.amount);
        assertHolds(step.token, amount, "withdraw");
        push(
          buildWithdrawCollateralOperation({
            token: step.token,
            amount,
            to: step.to,
            creditAccount,
            sdk,
          }),
        );
        break;
      }

      default: {
        const _exhaustive: never = step;
        void _exhaustive;
      }
    }
  }

  const { assets, totalValue, debt } = ledger.snapshot();
  const market = sdk.marketRegister.findByCreditManager(
    creditAccount.creditManager,
  );
  const suite = sdk.marketRegister.findCreditManager(
    creditAccount.creditManager,
  );
  const quotas = getQuotasForUpdate({
    assetsBefore: creditAccount.tokens,
    assetsAfter: assets,
    initialQuotas: creditAccount.tokens,
    quotaReserve,
    underlyingToken: underlying,
    liquidationThresholds: suite.creditManager.liquidationThresholds,
    quotas: market.pool.pqk.quotas,
    maxDebt: suite.creditFacade.maxDebt,
    convert: price,
  });
  if (quotas.quotaIncrease.length + quotas.quotaDecrease.length > 0) {
    push(buildQuotaUpdateOperation({ update: quotas, creditAccount, sdk }));
  }

  return {
    operations,
    state: {
      totalValue,
      accountDebt: debt,
      assets,
      quotas: quotas.desiredQuota,
    },
    calls: callsOf(operations),
  };
}

const callsOf = (operations: AccountCalculatorOperation[]): MultiCall[] =>
  operations.flatMap(op => op.calls);

const min = (a: bigint, b: bigint): bigint => (a < b ? a : b);
