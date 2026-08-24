import type { Address } from "viem";
import type { MultiCall, OnchainSDK } from "../../index.js";
import { calcPositionLeverage } from "../../market/math.js";
import type { AccountSnapshot } from "../../positions/types.js";
import type { WithdrawableAsset } from "../withdrawal-compressor/types.js";
import {
  assertCanBorrow,
  assertCollateralised,
  assertGrowthAllowed,
  assertQuotaHeadroom,
} from "./guards.js";
import {
  type AccountCalculatorOperation,
  buildAddCollateralOperation,
  buildClaimDelayedWithdrawalOperation,
  buildCloseSwapOperation,
  buildDecreaseDebtOperation,
  buildIncreaseDebtOperation,
  buildQuotaUpdateOperation,
  buildStartDelayedWithdrawalOperation,
  buildSwapOperation,
  buildUnwrapRwaCollateralOperation,
  buildWithdrawCollateralOperation,
  buildWrapRwaCollateralOperation,
  instantOutput,
  type QuotaUpdateState,
} from "./operations.js";
import type { Amount, Step } from "./plan.js";
import type {
  CreditAccountSlice,
  DelayedStart,
  OperationState,
} from "./types.js";
import { IntentPreviewError } from "./types.js";
import { eq, toTargetDecimals } from "./utils/common.js";
import { convertAmount } from "./utils/convert-amount.js";
import { OperationLedger } from "./utils/ledger.js";
import { isRedemptionPhantomToken } from "./utils/pick-token.js";
import {
  clearedQuotas,
  getQuotasForUpdate,
  quotasAfterUpdate,
} from "./utils/quotas-for-update.js";
import { createRouterPaths, type RouterPaths } from "./utils/router-path.js";

export interface RealizeProps {
  creditAccount: CreditAccountSlice;
  sdk: OnchainSDK;
  /** Router slippage in PERCENTAGE_FORMAT (100% = 10_000). */
  slippage: number;
  /** Extra quota headroom in PERCENTAGE_FORMAT. */
  quotaReserve: number | undefined;
  /**
   * Where routed legs are quoted. Defaults to the pathfinder, which is what
   * anything that will be sent needs; a walk that only projects a state passes
   * `createOraclePaths` instead.
   */
  paths?: RouterPaths;
}

export interface Realized {
  operations: AccountCalculatorOperation[];
  state: OperationState;
  calls: MultiCall[];
  /** Set when the plan started a redemption, i.e. it needs a tail. */
  delayed: DelayedStart | undefined;
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
  const paths =
    props.paths ?? createRouterPaths({ sdk, creditAccount, slippage });
  const market = sdk.marketRegister.findByCreditManager(
    creditAccount.creditManager,
  );
  const suite = sdk.marketRegister.findCreditManager(
    creditAccount.creditManager,
  );

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

  /** Output of the last convert or claim, for `RAISED` amounts. */
  let raised = 0n;
  /** The request, before the walk's end state can be attached to it. */
  let delayed: Omit<DelayedStart, "afterRequest"> | undefined;
  /**
   * Set by a `clearQuotas` step, which settles the quotas mid-walk instead of
   * at the end — and settles them at none, whatever the balances turn out to be.
   */
  let cleared: QuotaUpdateState | undefined;
  /**
   * Whether anything leaves the account, which is what makes the credit manager
   * judge the closing collateral check at safe prices.
   */
  let paysOut = false;
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
        assertCanBorrow(suite, step.amount);
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
          push(
            buildDecreaseDebtOperation({
              amount,
              // Covering the whole debt means the intent is to owe nothing, and
              // by the time the transaction lands the debt has grown by the
              // interest of a few blocks — so the call asks for all of it
              // rather than for the amount quoted here, which would leave dust
              // the facade refuses to let stand below `minDebt`.
              full: amount >= ledger.debt,
              creditAccount,
              sdk,
            }),
          );
        }
        break;
      }

      case "clearQuotas": {
        cleared = clearedQuotas(creditAccount.tokens);
        if (cleared.quotaDecrease.length > 0) {
          push(
            buildQuotaUpdateOperation({ update: cleared, creditAccount, sdk }),
          );
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
        const held = ledger.balanceOf(step.from);
        const leg = await paths.swap({
          tokenIn: step.from,
          tokenOut: step.to,
          amount,
          keep: held - amount,
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

      case "closeAll": {
        // The underlying is already what the route targets, and a balance the
        // router treats as dust is left where it is — both would otherwise be
        // projected as sold and the swept amounts would not add up.
        const balances = ledger
          .snapshot()
          .assets.filter(a => !eq(a.token, underlying) && a.balance > DUST);
        // A redemption phantom is a withdrawal still in flight: it cannot be
        // sold and it cannot leave, so the account cannot be emptied until its
        // claim has landed. The phantoms a position is held in (Convex and
        // friends) are sold by the route like any other balance.
        const pending = balances.find(a =>
          isRedemptionPhantomToken(sdk, a.token),
        );
        if (pending) {
          throw new IntentPreviewError(
            "withdrawalInProgress",
            `closeAll: ${pending.token} is a pending withdrawal, claim it first`,
          );
        }
        if (balances.length > 0) {
          const leg = await paths.closeAll({ balances });
          // Nothing to sell comes back empty on both counts; a projection comes
          // back with an amount and no calls, and still has to move the ledger.
          if (leg.calls.length > 0 || leg.minAmount > 0n) {
            push(
              buildCloseSwapOperation({
                from: balances,
                tokenOut: underlying,
                amountOut: leg.minAmount,
                calls: leg.calls,
              }),
            );
          }
        }
        raised = ledger.balanceOf(underlying);
        break;
      }

      case "withdraw": {
        const amount = amountOf(step.amount);
        assertHolds(step.token, amount, "withdraw");
        paysOut = true;
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

      case "request": {
        const asset = await delayedConfig(sdk, creditAccount, step.token);
        // One request at a time per asset: a phantom balance is a redemption
        // already in flight, and its claim owns the tail that follows it.
        if (ledger.balanceOf(asset.withdrawalPhantomToken) > 0n) {
          throw new IntentPreviewError(
            "withdrawalInProgress",
            `request: ${asset.withdrawalPhantomToken} already holds a pending withdrawal`,
          );
        }
        assertHolds(step.token, step.amount + step.reserve, "request");

        const preview = await sdk.accounts.previewDelayedWithdrawal({
          creditAccount: creditAccount.creditAccount,
          token: step.token,
          amount: step.amount,
          withdrawalPhantomToken: asset.withdrawalPhantomToken,
          intent: step.record,
        });
        push(
          buildStartDelayedWithdrawalOperation({ preview, creditAccount, sdk }),
        );
        // What the venue will hand over when the claim lands: the queued amount,
        // in the token this config redeems into. The phantom stands in for that
        // payout one for one, so only the decimals have to be reconciled.
        const queued = preview.outputs.find(o => o.isDelayed);
        delayed = {
          record: step.record,
          claimableAt: preview.claimableAt,
          settlement: queued ? "delayed" : "instant",
          claim: queued
            ? {
                token: asset.underlying.toLowerCase() as Address,
                amount: toTargetDecimals(
                  queued.amount,
                  queued.token,
                  asset.underlying,
                  sdk,
                ),
              }
            : undefined,
        };
        raised = instantOutput(preview.outputs)?.amount ?? 0n;
        break;
      }

      case "claim": {
        push(
          buildClaimDelayedWithdrawalOperation({
            claimable: step.claimable,
            creditAccount,
            sdk,
          }),
        );
        raised = instantOutput(step.claimable.outputs)?.amount ?? 0n;
        break;
      }

      case "sweep": {
        // The wrapper of an RWA market cannot leave the account, so it is
        // unwrapped before the walk rather than during it — that way the raw
        // asset is swept once, whatever the account already held of it.
        paysOut = true;
        const wrapped = ledger.balanceOf(underlying);
        if (rwaAsset && wrapped > 0n) {
          push(
            await buildUnwrapRwaCollateralOperation({
              tokenIn: underlying,
              amountIn: wrapped,
              tokenOut: rwaAsset,
              amountOut: toTargetDecimals(wrapped, underlying, rwaAsset, sdk),
              creditAccount,
              sdk,
            }),
          );
        }
        for (const { token, balance } of ledger.snapshot().assets) {
          push(
            buildWithdrawCollateralOperation({
              token,
              amount: balance,
              to: step.to,
              // The account is being emptied, and what it holds by then is
              // whatever the legs before happened to produce — so the facade
              // reads the balance rather than trusting the quote.
              all: true,
              creditAccount,
              sdk,
            }),
          );
        }
        break;
      }

      default: {
        const _exhaustive: never = step;
        void _exhaustive;
      }
    }
  }

  const { assets, totalValue, debt } = ledger.snapshot();
  assertGrowthAllowed({
    sdk,
    suite,
    market,
    before: creditAccount.tokens,
    after: assets,
  });
  // Quotas the plan already settled are not sized again: it dropped them
  // because the loan ends here, and the balances left behind do not argue.
  const quotas =
    cleared ??
    getQuotasForUpdate({
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
  if (
    !cleared &&
    quotas.quotaIncrease.length + quotas.quotaDecrease.length > 0
  ) {
    assertQuotaHeadroom(market, quotas.quotaIncrease);
    push(buildQuotaUpdateOperation({ update: quotas, creditAccount, sdk }));
  }

  // The update names only the tokens the plan touched, so what the account is
  // quoted at afterwards is it laid over the quotas the account came with —
  // which is both what the metrics below are judged on and what the caller is
  // shown.
  const quotasAfter = quotasAfterUpdate(
    creditAccount.tokens,
    quotas.desiredQuota,
  );

  const snapshot: AccountSnapshot = {
    creditManager: creditAccount.creditManager,
    assets,
    quotas: Object.values(quotasAfter),
    totalDebt: debt,
    totalValue,
  };
  const metrics = {
    healthFactor: sdk.positions.healthFactor(snapshot),
    // TODO: overall APY needs the collateral yield (lpAPY), which market
    // state alone does not carry — wire it up together with the ApyPlugin
    overallApy: 0,
    borrowRate: sdk.positions.borrowRate(snapshot),
    timeToLiquidation: sdk.positions.timeToLiquidation(snapshot),
    liquidationPrice: sdk.positions.liquidationPrice(snapshot),
  };
  // A call that hands funds over is checked against safe prices on-chain, so
  // the reported health factor is not the one that decides whether it lands.
  assertCollateralised(
    paysOut
      ? sdk.positions.healthFactor(snapshot, { safePrices: true })
      : metrics.healthFactor,
  );

  const state: OperationState = {
    totalValue,
    accountDebt: debt,
    leverage: calcPositionLeverage(totalValue, debt),
    assets,
    quotas: quotasAfter,
    ...metrics,
  };

  return {
    operations,
    state,
    calls: callsOf(operations),
    delayed: delayed && { ...delayed, afterRequest: state },
  };
}

/**
 * The redemption config for `token`, when the credit manager offers exactly one.
 *
 * Several configs mean several venues with different delays and outputs, and
 * nothing in the intent says which one was meant.
 */
async function delayedConfig(
  sdk: OnchainSDK,
  creditAccount: CreditAccountSlice,
  token: Address,
): Promise<WithdrawableAsset> {
  const compressor = sdk.withdrawalCompressor;
  if (!compressor) {
    throw new IntentPreviewError(
      "noDelayedRoute",
      "request: chain has no withdrawal compressor",
    );
  }

  const assets = await compressor.findWithdrawableAssets(
    creditAccount.creditManager,
    token,
  );
  if (assets.length === 0) {
    throw new IntentPreviewError(
      "noDelayedRoute",
      `request: ${token} has no delayed withdrawal config`,
    );
  }
  if (assets.length > 1) {
    throw new IntentPreviewError(
      "multipleDelayedWithdrawals",
      `request: ${token} has ${assets.length} delayed withdrawal configs`,
    );
  }
  return assets[0];
}

const callsOf = (operations: AccountCalculatorOperation[]): MultiCall[] =>
  operations.flatMap(op => op.calls);

const min = (a: bigint, b: bigint): bigint => (a < b ? a : b);
/** Balance the router's close path refuses to route, and leaves in place. */
const DUST = 10n;
