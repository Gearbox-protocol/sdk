import type { Address } from "viem";
import { MIN_HF_LIMITED } from "../../../common-utils/utils/validation/validate-hf.js";
import { SDKConstruct } from "../../base/SDKConstruct.js";
import { assertMarketOperable } from "./guards.js";
import { maxProportionalWithdrawal } from "./math.js";
import { maxWithdrawCollateral } from "./maxWithdrawCollateral.js";
import {
  type OpenStrategyPreview,
  type OpenStrategyProps,
  previewOpenStrategy,
} from "./open-strategy.js";
import {
  type AccountCalculatorOperation,
  instantOutput,
} from "./operations.js";
import {
  planAddCollateral,
  planAdjustLeverage,
  planAdjustLeverageDelayed,
  planDeposit,
  planFinishClaimOnly,
  planFinishDecreaseLeverage,
  planFinishWithdraw,
  planRepay,
  planWithdraw,
  planWithdrawAsset,
  planWithdrawDelayed,
  type Step,
} from "./plan.js";
import { realize } from "./realize.js";
import {
  type CreditAccountSlice,
  type DelayableIntent,
  type DelayedStart,
  type DelayedStartResult,
  type FinishIntentProps,
  IntentPreviewError,
  type IntentPreviewResult,
  type IntentRoutesResult,
  type PreviewErrorReason,
  type ResumableIntent,
  type RouteRefusals,
  type StartIntent,
  type StartIntentProps,
} from "./types.js";
import { accountView } from "./view.js";

export type {
  OpenStrategyPreview,
  OpenStrategyProps,
} from "./open-strategy.js";
export {
  type AddCollateralIntent,
  type AdjustLeverageIntent,
  type DelayableIntent,
  type DelayedRoute,
  type DelayedStart,
  type DelayedStartResult,
  type DepositStrategyIntent,
  type FinishIntentProps,
  type InstantRoute,
  IntentPreviewError,
  type IntentRoutesResult,
  type OperationState,
  type PreviewErrorReason,
  type RepayStrategyIntent,
  type ResumableIntent,
  type RouteRefusals,
  type StartIntent,
  type WithdrawAssetIntent,
  type WithdrawStrategyIntent,
} from "./types.js";
export {
  fetchCreditAccountSlice,
  toCreditAccountSlice,
} from "./utils/credit-account-slice.js";
export type {
  AccountCalculatorOperation,
  CreditAccountSlice,
  IntentPreviewResult,
};

/**
 * Open-strategy preview outcome.
 *
 * Shaped like {@link IntentPreviewResult} in its error half so all previews fail
 * the same way, but the payload is its own: opening has no existing account, so
 * there is no operation chain to report.
 */
export type OpenStrategyPreviewResult =
  | { ok: true; preview: OpenStrategyPreview }
  | { ok: false; reason: PreviewErrorReason };

/** An intent plus everything previewing it needs. */
type StartProps = StartIntentProps & { intent: StartIntent };

/**
 * Previews of everything a wallet can do to an existing credit account.
 *
 * Two halves, deliberately kept apart: `plan.ts` turns an intent into a few
 * steps with pure arithmetic, `realize.ts` turns the steps into router-backed
 * operations. This class only picks the planner and wraps the outcome.
 */
export class CreditAccountOperationsService extends SDKConstruct {
  /**
   * Previews an operation on an existing account.
   *
   * @param props - Intent plus account slice, quota reserve and slippage
   * @returns Operations, projected state and calldata, or `{ ok: false, reason }`
   * when the intent cannot be satisfied (e.g. the account lacks the source
   * balance)
   */
  async startIntent(props: StartProps): Promise<IntentPreviewResult> {
    return plain(
      await this.#preview(props, () => {
        const { intent } = props;
        const view = accountView(props.creditAccount, props.sdk);
        switch (intent.type) {
          case "ADD_COLLATERAL":
            return planAddCollateral(intent);
          case "WITHDRAW_ASSET":
            return planWithdrawAsset(intent, view);
          case "ADJUST_LEVERAGE":
            return planAdjustLeverage(intent, view);
          case "DEPOSIT":
            return planDeposit(intent, view);
          case "REPAY":
            return planRepay(intent, view);
          case "WITHDRAW":
            return planWithdraw(intent, view);
          default: {
            const _exhaustive: never = intent;
            void _exhaustive;
            throw new Error(
              `${(intent as StartIntent).type} - not implemented`,
            );
          }
        }
      }),
    );
  }

  /**
   * Largest `WITHDRAW` amount (in underlying) the account can take out while
   * keeping leverage and staying inside the facade's debt band — the ceiling a
   * withdraw form should offer. Taking everything out is the same intent with
   * `MAX_UINT256` for an amount, and needs none of this arithmetic.
   *
   * @param props - Account slice and the SDK holding its market
   * @returns Amount in underlying units; `0n` when nothing can leave
   */
  maxWithdraw(props: Pick<StartIntentProps, "creditAccount" | "sdk">): bigint {
    const view = accountView(props.creditAccount, props.sdk);
    return maxProportionalWithdrawal(view, view.band);
  }

  /**
   * Debt a `REPAY` would have to cover to settle the account, in underlying
   * units: principal plus the interest and fees accrued as of the read.
   *
   * A repayment of exactly this leaves nothing behind at the block it was read
   * at, and a little behind at any later one, since interest does not stop —
   * so a wallet meaning to clear the account sends this with a buffer on top,
   * which the intent caps at the debt rather than spending. `REPAY` with
   * `MAX_UINT256` sizes that buffer itself.
   *
   * @param props - Account slice and the SDK holding its market
   * @returns Amount in underlying units; `0n` on an account that owes nothing
   */
  maxRepay(props: Pick<StartIntentProps, "creditAccount" | "sdk">): bigint {
    return accountView(props.creditAccount, props.sdk).debt;
  }

  /**
   * Largest `WITHDRAW_ASSET` amount of one token the account can take out
   * while its health factor stays at {@link MIN_HF_LIMITED} plus a basis
   * point — the ceiling a withdraw-collateral form should offer. Thresholds,
   * prices and quota activity come from the account's market, valued the way
   * the facade values a call that pays out; zero debt frees the whole balance.
   *
   * @param props - Account slice, the SDK holding its market, and the
   * collateral to withdraw
   * @returns Amount in the token's units; `0n` when nothing can leave
   */
  maxWithdrawCollateral(
    props: Pick<StartIntentProps, "creditAccount" | "sdk"> & { token: Address },
  ): bigint {
    return maxWithdrawCollateral({
      ...props,
      // one basis point of room above the bar `validateHF` holds the account
      // to, so the answer does not sit exactly on it
      targetHF: MIN_HF_LIMITED + 2n,
    });
  }

  /**
   * Previews the same operation when its source only redeems through its
   * issuer: a Securitize dsToken, a Mellow share.
   *
   * Sits apart from {@link startIntent} because it is a different trade route,
   * not a different intent: the request goes to the issuer instead of the
   * router, and the proceeds — hence the repayment and the payout — arrive days
   * later. Both routes of one intent are quoted together by
   * {@link intentRoutes}; this is the one to call when the delayed route is the
   * only one of interest.
   *
   * @param props - Intent plus account slice, quota reserve and slippage
   * @returns The request transaction and what it recorded for the tail, or
   * `{ ok: false, reason }` — `noDelayedRoute` when this route does not exist
   * for the account at all
   */
  async startDelayedIntent(
    props: StartIntentProps & { intent: DelayableIntent },
  ): Promise<DelayedStartResult> {
    const { intent } = props;
    const result = await this.#preview(props, () => {
      const view = accountView(props.creditAccount, props.sdk);
      switch (intent.type) {
        case "ADJUST_LEVERAGE":
          return planAdjustLeverageDelayed(intent, view);
        case "WITHDRAW":
          return planWithdrawDelayed(intent, view);
        default: {
          const _exhaustive: never = intent;
          void _exhaustive;
          throw new Error(
            `${(intent as DelayableIntent).type} - cannot be delayed`,
          );
        }
      }
    });
    if (!result.ok) {
      return result;
    }
    if (!result.delayed) {
      throw new Error("startDelayedIntent: plan started no withdrawal");
    }
    return { ...result, delayed: result.delayed };
  }

  /**
   * Previews a delayable intent both ways at once: settled by the router now,
   * and started as a redemption that finishes days later.
   *
   * Which routes an account has depends on the intent and the token it sells,
   * and a form has to know before it can offer a choice — so both are quoted
   * from the same request and each is reported on its own. A route the account
   * cannot take comes back `undefined` with its refusal in `refused`; only when
   * neither answers is the whole result `{ ok: false }`.
   *
   * A route that could not be quoted at all — a pathfinder with no path out of
   * the source, a read that failed — counts as missing rather than fatal, since
   * the other route may be the one the caller wanted. With nothing left to
   * report the failure is rethrown, as {@link startIntent} would have.
   *
   * @param props - A withdraw or adjust-leverage intent plus account slice,
   * quota reserve and slippage
   * @returns Whichever routes are viable, or `{ ok: false, reason }` when none is
   */
  async intentRoutes(
    props: StartIntentProps & { intent: DelayableIntent },
  ): Promise<IntentRoutesResult> {
    const [instant, delayed] = await Promise.allSettled([
      this.startIntent(props),
      this.startDelayedIntent(props),
    ]);

    const instantRoute =
      instant.status === "fulfilled" && instant.value.ok
        ? instant.value
        : undefined;
    const delayedRoute =
      delayed.status === "fulfilled" && delayed.value.ok
        ? delayed.value
        : undefined;
    const refused: RouteRefusals = {
      instant:
        instant.status === "fulfilled" && !instant.value.ok
          ? instant.value.reason
          : undefined,
      delayed:
        delayed.status === "fulfilled" && !delayed.value.ok
          ? delayed.value.reason
          : undefined,
    };

    if (instantRoute || delayedRoute) {
      return {
        ok: true,
        instant: instantRoute,
        delayed: delayedRoute,
        refused,
      };
    }

    // Nothing answered. A refusal is a value the caller can act on, but a route
    // that could not be quoted at all is a genuine failure, and there is no
    // preview left to report it alongside.
    const failed = [instant, delayed].find(s => s.status === "rejected");
    if (failed?.status === "rejected") {
      throw failed.reason;
    }
    const reason = refused.instant ?? refused.delayed;
    if (reason === undefined) {
      throw new Error("intentRoutes: a route neither answered nor refused");
    }
    return { ok: false, reason, refused };
  }

  /**
   * Previews the tail of a delayed intent, once the withdrawal it started has
   * matured: the claim, then whatever the intent still owes.
   *
   * Serves the two operations that can genuinely be interrupted by a delay — a
   * withdrawal and a deleveraging. For the rest, the claim is the whole tail:
   * the tokens land on the account and only their quota has to catch up.
   *
   * @param props - The recorded intent, the account slice as it stands now, and
   * the matured claimable
   * @returns Shaped exactly like {@link startIntent}'s result, so both halves of
   * an operation are consumed the same way
   */
  async finishIntent(props: FinishIntentProps): Promise<IntentPreviewResult> {
    const { intent, claimable } = props;
    return plain(
      await this.#preview(props, () => {
        const view = accountView(props.creditAccount, props.sdk);
        // What the claim credits on the spot, which is what the tail spends.
        const claimed = (): { token: Address; amount: bigint } => {
          const output = instantOutput(claimable.outputs);
          if (!output) {
            throw new IntentPreviewError(
              "insufficientSourceBalance",
              "finishIntent: the claim credits nothing to spend",
            );
          }
          return output;
        };
        switch (intent.type) {
          case "WITHDRAW_COLLATERAL":
            return planFinishWithdraw(intent, claimable, claimed(), view);
          case "DECREASE_LEVERAGE":
            return planFinishDecreaseLeverage(claimable, claimed(), view);
          case "ADD_COLLATERAL":
          case "INCREASE_LEVERAGE":
          case "DEPOSIT":
          case "DEPOSIT_AND_INCREASE_LEVERAGE":
            return planFinishClaimOnly(claimable);
          default: {
            const _exhaustive: never = intent;
            void _exhaustive;
            throw new Error(
              `${(intent as ResumableIntent).type} - not implemented`,
            );
          }
        }
      }),
    );
  }

  /**
   * Previews opening a brand-new leveraged position.
   *
   * Sits apart from {@link startIntent} because there is no account yet: nothing
   * can be projected from existing balances, and the output feeds
   * `sdk.accounts.openCA` rather than a facade multicall assembled here.
   *
   * @param props - Credit manager, wallet collateral, target token and leverage
   * @returns Debt, position size, projected balances and quotas for both the
   * expected and the floor branch, or `{ ok: false, reason }` when the requested
   * leverage or the resulting debt is not viable
   */
  async openStrategyIntent(
    props: OpenStrategyProps,
  ): Promise<OpenStrategyPreviewResult> {
    try {
      return { ok: true, preview: await previewOpenStrategy(props) };
    } catch (e) {
      return asFailure(e);
    }
  }

  /** Plan → realise → wrap. Unviable requests become `{ ok: false }`. */
  async #preview(
    props: StartIntentProps,
    plan: () => Step[],
  ): Promise<Previewed> {
    try {
      assertMarketOperable(
        props.sdk.marketRegister.findCreditManager(
          props.creditAccount.creditManager,
        ),
      );
      const { operations, state, calls, delayed } = await realize(plan(), {
        creditAccount: props.creditAccount,
        sdk: props.sdk,
        slippage: props.slippage ?? 0,
        quotaReserve: props.quotaReserve,
      });
      return { ok: true, operations, preview: state, calls, delayed };
    } catch (e) {
      return asFailure(e);
    }
  }
}

/**
 * A preview before it is told apart: only a plan that requested a redemption
 * carries `delayed`, and only `startDelayedIntent` reports it.
 */
type Previewed =
  | (Extract<IntentPreviewResult, { ok: true }> & {
      delayed: DelayedStart | undefined;
    })
  | { ok: false; reason: PreviewErrorReason };

/** Drops the delayed half for the flows that cannot produce one. */
function plain(result: Previewed): IntentPreviewResult {
  if (!result.ok) {
    return result;
  }
  const { operations, preview, calls } = result;
  return { ok: true, operations, preview, calls };
}

/** Unviable requests are values; anything else is a genuine failure. */
function asFailure(e: unknown): { ok: false; reason: PreviewErrorReason } {
  if (e instanceof IntentPreviewError) {
    return { ok: false, reason: e.reason };
  }
  throw e;
}
