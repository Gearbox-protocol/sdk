import type { Address } from "viem";
import type { Bps } from "../../../model/index.js";
import type { Asset } from "../../index.js";

/**
 * Why a preview could not be produced.
 *
 * Every member is raised by the engine as an {@link IntentPreviewError}, with
 * the exception of `unsupportedTokenPair` and `noRecordedIntent`, which the
 * prepare namespace reports for a request it can refuse before planning.
 */
export type PreviewErrorReason =
  /** The debt the request implies falls outside the facade's band. */
  | "debtOutOfRange"
  /** The leverage asked for cannot be expressed as a plan at all. */
  | "leverageOutOfRange"
  /** Nothing on the account or in the wallet can fund what was asked. */
  | "insufficientSourceBalance"
  /** Input token is not accepted by the flow (e.g. deposit of a non-underlying). */
  | "unsupportedCollateralToken"
  /**
   * No route for the trade the plan needs: no pool pair between the tokens
   * requested, several and none was picked, or the pathfinder itself found no
   * path for the amounts involved.
   */
  | "unsupportedTokenPair"
  /**
   * The intent cannot settle with a delay: the source has no redemption config,
   * the chain has no compressor, or the payout is one the tail cannot serve.
   */
  | "noDelayedRoute"
  /** Several redemption venues for the source, and nothing says which. */
  | "multipleDelayedWithdrawals"
  /** A redemption of the same asset is already in flight. */
  | "withdrawalInProgress"
  /**
   * The claim names no operation to resume: requested without an intent, or
   * read through a compressor too old to report one.
   */
  | "noRecordedIntent"
  /** The facade or the pool behind it is paused: nothing can be done at all. */
  | "marketPaused"
  /** The facade is past its expiration date and takes no more multicalls. */
  | "marketExpired"
  /**
   * The pool cannot lend what the plan draws right now — its free liquidity,
   * the manager's debt limit or the per-block cap stands in the way.
   */
  | "insufficientPoolLiquidity"
  /** The market takes no more quota for a token the plan wants to hold. */
  | "quotaLimitReached"
  /** The plan would increase the balance of a token the market forbids. */
  | "forbiddenToken"
  /**
   * The account would end the transaction owing more than its collateral is
   * worth under liquidation thresholds, which the facade refuses to allow.
   */
  | "insufficientCollateral";

/**
 * The numbers behind each refusal, so a caller reads the limit that was missed
 * instead of re-deriving it.
 *
 * Anything with a token and an amount is an {@link Asset}; ratios carry no
 * token. `undefined` marks a reason raised from several places, only some of
 * which hold the numbers.
 */
export interface PreviewErrorDetails {
  /** All three in the market's underlying. */
  debtOutOfRange: { requested: Asset; minDebt: Asset; maxDebt: Asset };
  /**
   * Scaled by `LEVERAGE_DECIMALS` (`100n` = 1x), as the intent states it — not
   * the read model's `Leverage`. `undefined` where the floor is not fixed: the
   * deposit planner's is a function of the deposit.
   */
  leverageOutOfRange: { requested: bigint; min: bigint } | undefined;
  /** `undefined` where the request never got as far as naming an amount. */
  insufficientSourceBalance: { required: Asset; held: Asset } | undefined;
  unsupportedCollateralToken: { token: Address };
  /**
   * `to` is absent where the market named no output for `from`. The whole
   * detail is absent only when the pathfinder reverted rather than answered.
   */
  unsupportedTokenPair: { from: Address; to: Address | undefined } | undefined;
  noDelayedRoute: { token: Address } | undefined;
  multipleDelayedWithdrawals: { token: Address; venues: number };
  /** The phantom token standing for the redemption already in flight. */
  withdrawalInProgress: { inFlight: Asset };
  noRecordedIntent: undefined;
  marketPaused: { creditManager: Address };
  /** `expirationDate` is unix seconds, as the facade reports it. */
  marketExpired: { creditManager: Address; expirationDate: number };
  /** Both in the market's underlying. */
  insufficientPoolLiquidity: { requested: Asset; available: Asset };
  /**
   * `token` is the one whose quota is asked for; the amounts are in the
   * **underlying**, which is what a quota is measured in. `requested` is absent
   * for a token the market opened no quota for at all — nothing was weighed
   * against a limit.
   */
  quotaLimitReached: {
    token: Address;
    requested: Asset | undefined;
    available: Asset;
  };
  forbiddenToken: { token: Address };
  /**
   * `required` is the facade's bar. `healthFactor` is the factor the check
   * compared, which for a call that hands funds over is the safe-price one —
   * `safePrices` says which, since a preview always reports main prices.
   */
  insufficientCollateral: {
    healthFactor: Bps;
    required: Bps;
    safePrices: boolean;
  };
}

/**
 * The failure half every simulation shares.
 *
 * Distributed over the reasons rather than written as `{ reason; detail }`, so
 * that narrowing on `reason` narrows `detail` with it.
 */
export type PreviewRefusal = {
  [R in PreviewErrorReason]: {
    ok: false;
    reason: R;
    detail: PreviewErrorDetails[R];
  };
}[PreviewErrorReason];

/** Builds the refusal a caller sees. */
export function refuse<R extends PreviewErrorReason>(
  reason: R,
  detail: PreviewErrorDetails[R],
): PreviewRefusal {
  // Sound for every concrete `R`, which is all this is called with; the
  // compiler cannot correlate the two while `R` is open.
  return { ok: false, reason, detail } as PreviewRefusal;
}

/**
 * Validation failure that maps onto {@link PreviewErrorReason} rather than
 * crashing the caller: raised by the planners and the guards, turned into
 * `{ ok: false }` by `CreditAccountOperationsService`.
 */
export class IntentPreviewError<
  R extends PreviewErrorReason = PreviewErrorReason,
> extends Error {
  readonly reason: R;
  readonly detail: PreviewErrorDetails[R];

  constructor(reason: R, detail: PreviewErrorDetails[R], message?: string) {
    super(message ?? reason);
    this.name = "IntentPreviewError";
    this.reason = reason;
    this.detail = detail;
  }
}
