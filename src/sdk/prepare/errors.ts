import type { Address } from "viem";
import type {
  Bps,
  IGearboxError,
  Token,
  TokenAmount,
} from "../../model/index.js";
import type {
  BorrowLimitBinding,
  PreviewErrorReason,
  PreviewIssue,
  RouteRefusals,
} from "../../onchain/index.js";

/**
 * Why a preparation was refused.
 *
 * One interface per reason, discriminated by `code`, each carrying the numbers
 * behind that reason — so a caller reads the limit that was missed off the
 * error instead of re-deriving it. Switch on `code` and the fields narrow with
 * it.
 *
 * Most codes are the engine's `PreviewErrorReason` members, which is what keeps
 * `prepare` and `preview` refusing in one vocabulary; what differs is where the
 * numbers sit. The engine keeps them one level down, in `detail`, because it
 * distributes them over `reason`; here they are stated outright, so it is
 * `error.maxDebt` rather than `error.detail.maxDebt`.
 *
 * There is deliberately no union of all of them: each `prepare` method names
 * exactly the codes its own flow can raise, see the signatures in
 * {@link IOpportunitiesPrepare}. What is shared is the plumbing every flow
 * goes through, and that is the two base unions below.
 **/

/**
 * What ANY operation on an existing account can refuse with: the engine's
 * shared guards, the missing account, and a wrapped crash.
 **/
export type AccountFlowError =
  | MarketPausedError
  | MarketExpiredError
  | ForbiddenTokenError
  | QuotaLimitReachedError
  | InsufficientCollateralError
  | InsufficientSourceBalanceError
  | CreditAccountNotFoundError
  | UnexpectedFailureError;

/** Same guards for the account-less open flow. */
export type OpenFlowError =
  | MarketPausedError
  | MarketExpiredError
  | ForbiddenTokenError
  | QuotaLimitReachedError
  | InsufficientCollateralError
  | InsufficientSourceBalanceError
  | UnexpectedFailureError;

/** The debt the request implies falls outside the facade's band. */
export interface DebtOutOfRangeError extends IGearboxError {
  code: "debtOutOfRange";
  /** All three in the market's underlying. */
  requested: TokenAmount;
  minDebt: TokenAmount;
  maxDebt: TokenAmount;
}

/** The leverage asked for cannot be expressed as a plan at all. */
export interface LeverageOutOfRangeError extends IGearboxError {
  code: "leverageOutOfRange";
  /**
   * Scaled by `LEVERAGE_DECIMALS` (`100n` = 1x), as the intent states it — not
   * the read model's `Leverage`. Both are absent where the floor is not fixed:
   * the deposit planner's is a function of the deposit.
   **/
  requested?: bigint;
  min?: bigint;
}

/** Nothing on the account or in the wallet can fund what was asked. */
export interface InsufficientSourceBalanceError extends IGearboxError {
  code: "insufficientSourceBalance";
  /**
   * Both absent where the request never got as far as naming an amount, which
   * is most of the sites that raise this.
   **/
  required?: TokenAmount;
  held?: TokenAmount;
}

/** Input token is not accepted by the flow (e.g. deposit of a non-underlying). */
export interface UnsupportedCollateralTokenError extends IGearboxError {
  code: "unsupportedCollateralToken";
  token: Token;
}

/**
 * No route for the trade the plan needs: no pool pair between the tokens
 * requested, several and none was picked, or the pathfinder itself found no
 * path for the amounts involved.
 **/
export interface UnsupportedTokenPairError extends IGearboxError {
  code: "unsupportedTokenPair";
  /**
   * `to` is absent where the market named no output for `from`; both are absent
   * when the pathfinder reverted rather than answered.
   **/
  from?: Token;
  to?: Token;
}

/**
 * The intent cannot settle with a delay: the source has no redemption config,
 * the chain has no compressor, or the payout is one the tail cannot serve.
 **/
export interface NoDelayedRouteError extends IGearboxError {
  code: "noDelayedRoute";
  /** Absent where the refusal is the intent's, not the token's. */
  token?: Token;
}

/** Several redemption venues for the source, and nothing says which. */
export interface MultipleDelayedWithdrawalsError extends IGearboxError {
  code: "multipleDelayedWithdrawals";
  token: Token;
  venues: number;
}

/** A redemption of the same asset is already in flight. */
export interface WithdrawalInProgressError extends IGearboxError {
  code: "withdrawalInProgress";
  /** The phantom token standing for the redemption already in flight. */
  inFlight: TokenAmount;
}

/**
 * The claim names no operation to resume: requested without an intent, or read
 * through a compressor too old to report one.
 **/
export interface NoRecordedIntentError extends IGearboxError {
  code: "noRecordedIntent";
}

/** The facade is paused: nothing can be done at all. */
export interface MarketPausedError extends IGearboxError {
  code: "marketPaused";
  /**
   * The paused credit manager. Always present from `prepare`: the engine's
   * shared guards check the manager, and the pool-paused variant is raised
   * only by the preview-side `checkOperation` — it never reaches this union.
   **/
  creditManager: Address;
}

/** The facade is past its expiration date and takes no more multicalls. */
export interface MarketExpiredError extends IGearboxError {
  code: "marketExpired";
  creditManager: Address;
  /** Unix seconds, as the facade reports it. */
  expirationDate: number;
}

/**
 * The pool cannot lend what the plan draws right now — its free liquidity, the
 * manager's debt limit or the per-block cap stands in the way.
 **/
export interface InsufficientPoolLiquidityError extends IGearboxError {
  code: "insufficientPoolLiquidity";
  /** Both in the market's underlying. */
  requested: TokenAmount;
  available: TokenAmount;
  /**
   * Which of the four ceilings ran out first, so a caller can say what would
   * fix it — waiting for lenders and asking governance are opposite answers.
   **/
  binding: BorrowLimitBinding;
  /**
   * The largest position still openable, absent when even the minimum debt does
   * not fit.
   **/
  solutionAmount?: TokenAmount;
}

/** The market takes no more quota for a token the plan wants to hold. */
export interface QuotaLimitReachedError extends IGearboxError {
  code: "quotaLimitReached";
  /** The token whose quota is asked for. */
  token: Token;
  /**
   * In the **underlying**, which is what a quota is measured in. `requested` is
   * absent for a token the market opened no quota for at all — nothing was
   * weighed against a limit.
   **/
  requested: TokenAmount | undefined;
  available: TokenAmount;
}

/** The plan would increase the balance of a token the market forbids. */
export interface ForbiddenTokenError extends IGearboxError {
  code: "forbiddenToken";
  token: Token;
}

/**
 * The account would end the transaction owing more than its collateral is worth
 * under liquidation thresholds, which the facade refuses to allow.
 **/
export interface InsufficientCollateralError extends IGearboxError {
  code: "insufficientCollateral";
  /**
   * The factor that was compared, which for a call that hands funds over is the
   * safe-price one; `safePrices` says which, since a projection always reports
   * main prices.
   **/
  healthFactor: Bps;
  /**
   * The bar it was weighed against — the facade's own `1.0` for a check that
   * asks whether the transaction lands, a form's higher bar for one that asks
   * whether it is wise.
   **/
  required: Bps;
  safePrices: boolean;
}

/** The pool is winding down: it still pays out, but takes no more deposits. */
export interface PoolSunsetError extends IGearboxError {
  code: "poolSunset";
  pool: Address;
}

/**
 * The account would end up with more quoted tokens than the facade enables at
 * once. A count, not an amount — unlike {@link QuotaLimitReachedError}.
 **/
export interface QuotaCountExceededError extends IGearboxError {
  code: "quotaCountExceeded";
  count: number;
  max: number;
}

/**
 * The transaction could not be replayed: it is malformed, and every field
 * derived from replayed balances is guesswork.
 **/
export interface MalformedTransactionError extends IGearboxError {
  code: "malformedTransaction";
  /**
   * The SDK's own preview error code (the `ERROR_*` 1xxx constants). Named
   * apart from `code`, which every error in the envelope spells the same way.
   **/
  previewCode: number;
  /** What the replay reported, which is narrower than {@link message}. */
  detail: string;
}

/**
 * Opening asked for no target token and the market names none of its own, so
 * there is nothing to put the position into.
 *
 * A market fact, not a bad argument: pass a `targetToken` to open against a
 * manager that has no default one.
 **/
export interface NoStrategyTargetCollateralError extends IGearboxError {
  code: "noStrategyTargetCollateral";
  creditManager: Address;
}

/**
 * No account at that address in the markets this SDK is connected to — closed
 * since it was listed, or read on the wrong chain.
 **/
export interface CreditAccountNotFoundError extends IGearboxError {
  code: "creditAccountNotFound";
  creditAccount: Address;
}

/**
 * The SDK could not answer at all: a read that failed, a chain it is not
 * connected to, a market or token address it knows nothing about, a contract
 * that reverted where nothing should, a bug of ours.
 *
 * The one code that is not a verdict on the request — everything above says
 * "this cannot be done", this one says "we do not know". It exists so that a
 * refusable `prepare` method always answers: the failure that used to escape
 * as an exception arrives here instead, whole, under `cause`.
 **/
export interface UnexpectedFailureError extends IGearboxError {
  code: "unexpectedFailure";
  /** What actually went wrong, for a log and a bug report. */
  cause: Error;
}

/**
 * What every refusal of a two-route request carries on top of its own code,
 * see {@link StrategyRoutesResult}.
 *
 * `refused` says why each route is missing, which is the answer a form needs
 * even when neither exists: the error itself is the instant route's refusal —
 * the one a caller can usually act on — or the delayed route's when the instant
 * one did not get far enough to have a reason of its own.
 **/
export interface WithRouteRefusals {
  refused: RouteRefusals;
}

/**
 * One sentence per refusal, naming what was ruled out rather than restating the
 * numbers the error already carries.
 *
 * English and loggable, not a string to put on a screen: a form renders the
 * code and the amounts in its own words, see {@link IGearboxError.message}.
 **/
const MESSAGES: Record<PreviewErrorReason, string> = {
  debtOutOfRange: "The debt this request implies is outside the market's band.",
  leverageOutOfRange: "The leverage asked for cannot be expressed as a plan.",
  insufficientSourceBalance:
    "Neither the account nor the wallet holds enough to fund this request.",
  unsupportedCollateralToken: "This flow does not accept that token.",
  unsupportedTokenPair: "No route exists between these two tokens.",
  noDelayedRoute: "This request cannot be served as a delayed redemption.",
  multipleDelayedWithdrawals:
    "The source asset has several redemption venues and none was named.",
  withdrawalInProgress:
    "A redemption of this asset is already in flight on the account.",
  noRecordedIntent: "The claim names no operation to resume.",
  marketPaused: "The market is paused.",
  marketExpired: "The market is past its expiration date.",
  insufficientPoolLiquidity: "The pool cannot lend what this plan draws.",
  quotaLimitReached:
    "The market takes no more quota for a token this plan holds.",
  forbiddenToken: "This plan would increase the balance of a forbidden token.",
  insufficientCollateral:
    "The account would end this transaction under-collateralised.",
  poolSunset: "The pool is winding down and takes no more deposits.",
  quotaCountExceeded:
    "The account would hold more quoted tokens than the facade enables at once.",
  malformedTransaction: "The transaction could not be replayed.",
};

/**
 * The error each engine reason maps to — the range of {@link toRefusalError},
 * spelled reason by reason so a narrow issue arrives as a narrow error.
 *
 * A lookup table, not a vocabulary: nothing answers with `RefusalErrors[R]`
 * as a union. The unions callers see are the ones each method's signature
 * spells out.
 **/
export interface RefusalErrors {
  debtOutOfRange: DebtOutOfRangeError;
  leverageOutOfRange: LeverageOutOfRangeError;
  insufficientSourceBalance: InsufficientSourceBalanceError;
  unsupportedCollateralToken: UnsupportedCollateralTokenError;
  unsupportedTokenPair: UnsupportedTokenPairError;
  noDelayedRoute: NoDelayedRouteError;
  multipleDelayedWithdrawals: MultipleDelayedWithdrawalsError;
  withdrawalInProgress: WithdrawalInProgressError;
  noRecordedIntent: NoRecordedIntentError;
  marketPaused: MarketPausedError;
  marketExpired: MarketExpiredError;
  insufficientPoolLiquidity: InsufficientPoolLiquidityError;
  quotaLimitReached: QuotaLimitReachedError;
  forbiddenToken: ForbiddenTokenError;
  insufficientCollateral: InsufficientCollateralError;
  poolSunset: PoolSunsetError;
  quotaCountExceeded: QuotaCountExceededError;
  malformedTransaction: MalformedTransactionError;
}

/**
 * The engine's refusal, as the error the namespace answers with.
 *
 * One place does the lifting, so the two shapes cannot drift: `reason` becomes
 * `code`, the detail is spread onto the error, and the sentence comes from
 * {@link MESSAGES}. A malformed transaction is spelled out rather than spread,
 * because its detail names a `code` and a `message` of its own and they are not
 * the envelope's.
 *
 * Generic over the issue it is handed, so a call site that already knows the
 * reason gets that reason's error back rather than a union to narrow again.
 **/
export function toRefusalError<I extends PreviewIssue>(
  issue: I,
): RefusalErrors[I["reason"]] {
  if (issue.reason === "malformedTransaction") {
    return {
      code: "malformedTransaction",
      message: MESSAGES.malformedTransaction,
      previewCode: issue.detail.code,
      detail: issue.detail.message,
    } as RefusalErrors[I["reason"]];
  }
  // Sound for every concrete reason above: each detail is exactly the fields
  // that reason's error declares. The compiler cannot correlate the two while
  // the reason is still open.
  return {
    code: issue.reason,
    message: MESSAGES[issue.reason],
    ...issue.detail,
  } as RefusalErrors[I["reason"]];
}

/**
 * {@inheritDoc NoStrategyTargetCollateralError}
 **/
export function noStrategyTargetCollateral(
  creditManager: Address,
): NoStrategyTargetCollateralError {
  return {
    code: "noStrategyTargetCollateral",
    message: `Credit manager ${creditManager} has no strategy target collateral, and none was named.`,
    creditManager,
  };
}

/**
 * {@inheritDoc CreditAccountNotFoundError}
 **/
export function creditAccountNotFound(
  creditAccount: Address,
): CreditAccountNotFoundError {
  return {
    code: "creditAccountNotFound",
    message: `Credit account not found: ${creditAccount}.`,
    creditAccount,
  };
}

/**
 * {@inheritDoc UnexpectedFailureError}
 *
 * Takes what was thrown, whatever that is: a `throw` is not obliged to raise an
 * `Error`, and `cause` promises one.
 **/
export function unexpectedFailure(thrown: unknown): UnexpectedFailureError {
  const cause = thrown instanceof Error ? thrown : new Error(String(thrown));
  return {
    code: "unexpectedFailure",
    message: `The SDK could not prepare this operation: ${cause.message}`,
    cause,
  };
}
