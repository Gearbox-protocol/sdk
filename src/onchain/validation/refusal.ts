import type { Address } from "viem";
import type {
  Bps,
  MalformedPreviewError,
  Token,
  TokenAmount,
} from "../../model/index.js";

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
  | "insufficientCollateral"
  /** The pool is winding down: it still pays out, but takes no more deposits. */
  | "poolSunset"
  /**
   * The account would end up with more quoted tokens than the facade enables
   * at once. A count, not an amount — unlike `quotaLimitReached`.
   */
  | "quotaCountExceeded"
  /**
   * The transaction could not be replayed: it is malformed, and every field
   * derived from replayed balances is guesswork.
   */
  | "malformedTransaction";

/**
 * The numbers behind each refusal, so a caller reads the limit that was missed
 * instead of re-deriving it.
 *
 * Anything with a token and an amount is a {@link TokenAmount}; ratios carry
 * no token. `undefined` marks a reason raised from several places, only some of
 * which hold the numbers.
 */
export interface PreviewErrorDetails {
  /** All three in the market's underlying. */
  debtOutOfRange: {
    requested: TokenAmount;
    minDebt: TokenAmount;
    maxDebt: TokenAmount;
  };
  /**
   * Scaled by `LEVERAGE_DECIMALS` (`100n` = 1x), as the intent states it — not
   * the read model's `Leverage`. `undefined` where the floor is not fixed: the
   * deposit planner's is a function of the deposit.
   */
  leverageOutOfRange: { requested: bigint; min: bigint } | undefined;
  /** `undefined` where the request never got as far as naming an amount. */
  insufficientSourceBalance:
    | { required: TokenAmount; held: TokenAmount }
    | undefined;
  unsupportedCollateralToken: { token: Token };
  /**
   * `to` is absent where the market named no output for `from`. The whole
   * detail is absent only when the pathfinder reverted rather than answered.
   */
  unsupportedTokenPair: { from: Token; to: Token | undefined } | undefined;
  noDelayedRoute: { token: Token } | undefined;
  multipleDelayedWithdrawals: { token: Token; venues: number };
  /** The phantom token standing for the redemption already in flight. */
  withdrawalInProgress: { inFlight: TokenAmount };
  noRecordedIntent: undefined;
  /**
   * Which contract is paused. A credit account operation names the manager, an
   * LP operation the pool — the two are never both present.
   */
  marketPaused: { creditManager: Address } | { pool: Address };
  /** `expirationDate` is unix seconds, as the facade reports it. */
  marketExpired: { creditManager: Address; expirationDate: number };
  /**
   * Both in the market's underlying. `binding` names which of the four ceilings
   * ran out first, so a caller can say what would fix it — waiting for lenders
   * and asking governance are opposite answers. `solutionAmount` is the largest
   * position still openable, absent when even the minimum debt does not fit.
   */
  insufficientPoolLiquidity: {
    requested: TokenAmount;
    available: TokenAmount;
    binding: BorrowLimitBinding;
    solutionAmount?: TokenAmount;
  };
  /**
   * `token` is the one whose quota is asked for; the amounts are in the
   * **underlying**, which is what a quota is measured in. `requested` is absent
   * for a token the market opened no quota for at all — nothing was weighed
   * against a limit.
   */
  quotaLimitReached: {
    token: Token;
    requested: TokenAmount | undefined;
    available: TokenAmount;
  };
  forbiddenToken: { token: Token };
  /**
   * `required` is the bar the factor was weighed against — the facade's own
   * `1.0` for a check that asks whether the transaction lands, a form's higher
   * bar for one that asks whether it is wise. `healthFactor` is the factor
   * compared, which for a call that hands funds over is the safe-price one;
   * `safePrices` says which, since a preview always reports main prices.
   */
  insufficientCollateral: {
    healthFactor: Bps;
    required: Bps;
    safePrices: boolean;
  };
  poolSunset: { pool: Address };
  /** How many quoted tokens the account would end with, against the cap. */
  quotaCountExceeded: { count: number; max: number };
  /**
   * The malformed-preview warning the SDK recorded, and its human-readable
   * detail.
   */
  malformedTransaction: MalformedPreviewError;
}

/**
 * Which ceiling ran out when a borrow could not be served.
 *
 * The names are the expressions, not the legacy labels, because the two do not
 * line up: the legacy `insufficientDebtLimit` was the manager's own headroom
 * (`managerDebtAvailable`), `insufficientPoolDebtLimit` was `poolDebtLimit`,
 * and `insufficientPoolLiquidity` was what the manager could still draw
 * (`poolAvailableLiquidity`).
 *
 * `borrowable()` weighs only three of these — the pool's free liquidity, the
 * manager's remaining allowance and the facade's per-block cap. `poolDebtLimit`
 * is read by the account-opening path alone, which is why it is not among them.
 */
export type BorrowLimitBinding =
  | "poolAvailableLiquidity"
  | "poolDebtLimit"
  | "managerDebtAvailable"
  | "facadePerBlockCap";

/**
 * The failure half every simulation shares.
 *
 * Distributed over the reasons rather than written as `{ reason; detail }`, so
 * that narrowing on `reason` narrows `detail` with it.
 */
export type PreviewIssue = {
  [R in PreviewErrorReason]: {
    reason: R;
    detail: PreviewErrorDetails[R];
  };
}[PreviewErrorReason];

/**
 * The failure half every simulation shares: an issue, plus the `ok: false`
 * that tells it apart from a preview.
 */
export type PreviewRefusal = { ok: false } & PreviewIssue;

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

/**
 * Throws the issue a check found, with the sentence the engine logs for it.
 *
 * Returns normally when there is nothing to raise, so it cannot narrow a type
 * the way a bare `throw` does — a site that guards a value for the code below
 * it keeps throwing directly.
 */
export function raise(issue: PreviewIssue | null, message: string): void {
  if (issue) {
    throw new IntentPreviewError(issue.reason, issue.detail, message);
  }
}
