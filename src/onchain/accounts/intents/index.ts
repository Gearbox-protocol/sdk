import type { Address } from "viem";
import { SDKConstruct } from "../../base/SDKConstruct.js";
import { MIN_HF_LIMITED } from "../../validation/index.js";
import {
  IntentPreviewError,
  type PreviewRefusal,
  refuse,
} from "../../validation/refusal.js";
import { assertMarketOperable } from "./guards.js";

import {
  calcLeverageBand,
  type LeverageBand,
  type LeverageBandProps,
} from "./leverage-band.js";
import { maxProportionalWithdrawal } from "./math.js";
import { maxWithdrawCollateral } from "./maxWithdrawCollateral.js";
import {
  buildOpenStrategyState,
  type OpenStrategyProps,
  type OpenStrategyState,
} from "./open-strategy.js";
import type {
  AccountCalculatorOperation,
  StartDelayedWithdrawalOperation,
} from "./operations.js";
import {
  planAddCollateral,
  planAdjustLeverage,
  planAdjustLeverageDelayed,
  planDeposit,
  planRepay,
  planWithdraw,
  planWithdrawAsset,
  planWithdrawDelayed,
  type Step,
} from "./plan.js";
import { realize } from "./realize.js";
import { planTail, projectTail } from "./tail.js";
import type {
  ClaimRemainder,
  CreditAccountSlice,
  DelayableIntent,
  DelayedStart,
  DelayedStartResult,
  FinishIntentProps,
  FinishIntentResult,
  IntentPreviewResult,
  IntentRoutesResult,
  RouteRefusals,
  StartIntent,
  StartIntentProps,
  WithdrawCeilings,
} from "./types.js";
import { accountView } from "./view.js";

export type { LeverageBand } from "./leverage-band.js";
export type {
  OpenStrategyProps,
  OpenStrategyState,
} from "./open-strategy.js";
export type {
  AddCollateralIntent,
  AdjustLeverageIntent,
  ClaimRemainder,
  DelayableIntent,
  DelayedRoute,
  DelayedStart,
  DelayedStartResult,
  DepositStrategyIntent,
  FinishIntentProps,
  FinishIntentResult,
  InstantRoute,
  IntentRoutesResult,
  OperationState,
  PathLossRate,
  RepayStrategyIntent,
  ResumableIntent,
  RouteRefusals,
  StartIntent,
  WithdrawAssetIntent,
  WithdrawCeilings,
  WithdrawStrategyIntent,
} from "./types.js";
export {
  fetchCreditAccountSlice,
  toCreditAccountSlice,
} from "./utils/credit-account-slice.js";
export { isPhantomToken } from "./utils/pick-token.js";
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
  | { ok: true; state: OpenStrategyState }
  | PreviewRefusal;

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
            // disposition(D1-S6): kept — unreachable invariant behind the
            // typed StartIntent union; no caller input reaches it.
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
   * Both ends of what a `WITHDRAW` can take out, in underlying: the largest
   * partial withdrawal that keeps leverage and stays inside the facade's
   * `debtLimits`, and the net value an exit hands over. They are reported together
   * because a withdraw form needs both — the range it may offer, and the one
   * amount past it that is allowed — and because the distance between them is
   * the account's own, not a constant a caller could assume.
   *
   * Takes no target health factor, unlike {@link maxWithdrawCollateral}: a
   * proportional withdrawal leaves the factor where it found it, and the
   * facade's `minDebt` is what bounds it.
   *
   * @param props - Account slice and the SDK holding its market
   * @returns The two ceilings, see {@link WithdrawCeilings} for the gap between
   * them
   */
  maxWithdraw(
    props: Pick<StartIntentProps, "creditAccount" | "sdk">,
  ): WithdrawCeilings {
    const view = accountView(props.creditAccount, props.sdk);
    return {
      partial: maxProportionalWithdrawal(view, view.debtLimits),
      // an account underwater owes more than it holds, and has nothing to hand
      // over on the way out
      exit: view.collateral > 0n ? view.collateral : 0n,
    };
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
   * The leverages a position of a given size can be opened at, or moved to.
   *
   * A credit manager's `maxLeverage` follows from the liquidation threshold
   * alone, so it is the same for a hundred dollars and for a million. What a
   * given deposit reaches is decided by the debt it implies and by the
   * `debtLimits` the market puts that debt in — the range a leverage slider should offer.
   *
   * Unlike the other ceilings here this one reads no account: opening has none
   * yet, and adjusting measures against the net value the caller already
   * holds. Nothing is fetched, so a form can ask on every keystroke.
   *
   * @param props - The manager, the SDK holding its market, what stands
   * behind the position, and optionally the health factor the ceiling should
   * leave
   * @returns The band, or nothing when the market has none to offer
   */
  leverageBand(props: LeverageBandProps): LeverageBand | undefined {
    return calcLeverageBand(props);
  }

  /**
   * Largest `WITHDRAW_ASSET` amount of one token the account can take out
   * while its health factor stays at `targetHF` — the ceiling a
   * withdraw-collateral form should offer. Thresholds, prices and quota
   * activity come from the account's market, valued the way the facade values
   * a call that pays out; zero debt frees the whole balance.
   *
   * The default is {@link MIN_HF_LIMITED}, the threshold a form holds an
   * account to.
   *
   * @param props - Account slice, the SDK holding its market, the collateral
   * to withdraw, and optionally the health factor to leave behind
   * @returns Amount in the token's units; `0n` when nothing can leave
   */
  maxWithdrawCollateral(
    props: Pick<StartIntentProps, "creditAccount" | "sdk"> & {
      token: Address;
      targetHF?: bigint;
    },
  ): bigint {
    const { targetHF = MIN_HF_LIMITED, ...rest } = props;
    return maxWithdrawCollateral({
      ...rest,
      // two basis points clear of the threshold: a ceiling equal to it would
      // make a Max button produce an amount the form then refuses
      targetHF: targetHF + 2n,
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
   * `preview` is where the intent ends — the account once the redemption has
   * matured, been claimed and the tail has run — because that is what the
   * caller asked for; the half-way state the request itself lands in is
   * `delayed.afterRequest`. Both are validated, so a request whose tail could
   * not be completed is refused instead of started.
   *
   * @param props - Intent plus account slice, quota reserve and slippage
   * @returns The request transaction, the state it ends in and what it recorded
   * for the tail, or `{ ok: false, reason }` — `noDelayedRoute` when this route
   * does not exist for the account at all
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
    const { delayed } = result;
    if (!delayed) {
      // disposition(D1-S6): kept — engine self-contradiction (a successful
      // delayed plan without its withdrawal), a bug rather than a refusal.
      throw new Error("startDelayedIntent: plan started no withdrawal");
    }

    // A request that the venue served on the spot has no tail to project: no
    // claim is coming, so the state it landed in is the last one there is.
    if (delayed.settlement === "instant") {
      return { ...result, delayed };
    }

    const request = result.operations.find(
      (op): op is StartDelayedWithdrawalOperation =>
        op.type === "startDelayedWithdrawal",
    );
    if (!request) {
      // disposition(D1-S6): kept — engine self-contradiction (a delayed plan
      // whose operations carry no request), a bug rather than a refusal.
      throw new Error("startDelayedIntent: no request among the operations");
    }

    try {
      const tail = await projectTail({
        request,
        delayed,
        creditAccount: props.creditAccount,
        sdk: props.sdk,
        quotaReserve: props.quotaReserve,
      });
      return { ...result, state: tail.state, delayed };
    } catch (e) {
      // A tail that cannot be walked is a request that would strand the
      // account, so it is refused here rather than started and regretted.
      return asFailure(e);
    }
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
    const instantRefusal =
      instant.status === "fulfilled" && !instant.value.ok
        ? instant.value
        : undefined;
    const delayedRefusal =
      delayed.status === "fulfilled" && !delayed.value.ok
        ? delayed.value
        : undefined;
    const refused: RouteRefusals = {
      instant: instantRefusal?.reason,
      delayed: delayedRefusal?.reason,
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
    const chosen = instantRefusal ?? delayedRefusal;
    if (chosen === undefined) {
      // disposition(D1-S6): kept — allSettled invariant; every route settles
      // as an answer or a refusal, anything else is a bug.
      throw new Error("intentRoutes: a route neither answered nor refused");
    }
    return { ...chosen, refused };
  }

  /**
   * Previews the tail of a delayed intent, once the withdrawal it started has
   * matured: the claim, then whatever the intent still owes.
   *
   * Serves the three operations that can genuinely be interrupted by a delay —
   * a withdrawal, a deleveraging and an exit. For the rest, the claim is the
   * whole tail: the tokens land on the account and only their quota has to
   * catch up.
   *
   * A claim that brought only part of what the request queued — a legacy Mellow
   * multivault, which pays out what it holds liquid and re-queues the rest — is
   * served in proportion, and what it did not settle comes back as `remainder`:
   * the withdrawal still in flight and the intent to finish it with.
   *
   * @param props - The recorded intent, the account slice as it stands now, and
   * the matured claimable
   * @returns Shaped exactly like {@link startIntent}'s result with the remainder
   * beside it, so both halves of an operation are consumed the same way
   */
  async finishIntent(props: FinishIntentProps): Promise<FinishIntentResult> {
    let remainder: ClaimRemainder | undefined;
    const result = await this.#preview(props, () => {
      const tail = planTail({
        intent: props.intent,
        claimable: props.claimable,
        view: accountView(props.creditAccount, props.sdk),
      });
      remainder = tail.remainder;
      return tail.steps;
    });
    if (!result.ok) {
      return result;
    }
    const { operations, state, calls } = result;
    return { ok: true, operations, state, calls, remainder };
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
      return { ok: true, state: await buildOpenStrategyState(props) };
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
      return { ok: true, operations, state, calls, delayed };
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
  | PreviewRefusal;

/** Drops the delayed half for the flows that cannot produce one. */
function plain(result: Previewed): IntentPreviewResult {
  if (!result.ok) {
    return result;
  }
  const { operations, state, calls } = result;
  return { ok: true, operations, state, calls };
}

/** Unviable requests are values; anything else is a genuine failure. */
function asFailure(e: unknown): PreviewRefusal {
  if (e instanceof IntentPreviewError) {
    return refuse(e.reason, e.detail);
  }
  if (isUnroutable(e)) {
    // The revert names no pair: the leg that asked for one is frames away.
    return refuse("unsupportedTokenPair", undefined);
  }
  throw e;
}

/**
 * How the pathfinder says there is no route: it reverts instead of answering
 * with an empty path, so viem raises a contract error where the rest of the
 * engine raises an {@link IntentPreviewError}. Nothing is wrong — the trade
 * asked for cannot be made, which is a refusal the caller can act on, and one
 * `intentRoutes` in particular must keep as a value so the other route can
 * still be offered.
 */
function isUnroutable(e: unknown): boolean {
  for (let cause: unknown = e; cause instanceof Error; cause = cause.cause) {
    if (cause.message.includes("no optimal edge found")) {
      return true;
    }
  }
  return false;
}
