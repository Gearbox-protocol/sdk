import type { Address } from "viem";
import type { Token, TokenAmount } from "../primitives.js";
import type { IGearboxError } from "./base.js";

/**
 * Input token is not accepted by the flow (e.g. deposit of a non-underlying).
 **/
export interface UnsupportedCollateralTokenError extends IGearboxError {
  code: "unsupportedCollateralToken";
  token: Token;
}

/** {@inheritDoc UnsupportedCollateralTokenError} */
export function unsupportedCollateralToken(
  token: Token,
): UnsupportedCollateralTokenError {
  return {
    code: "unsupportedCollateralToken",
    message: `This flow does not accept ${token.symbol}.`,
    token,
  };
}

/**
 * No route for the trade the plan needs: no pool pair between the tokens,
 * several and none was picked, or the pathfinder found no path.
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

/** {@inheritDoc UnsupportedTokenPairError} */
export function unsupportedTokenPair(
  args: Omit<UnsupportedTokenPairError, "code" | "message"> = {},
): UnsupportedTokenPairError {
  const { from, to } = args;
  return {
    code: "unsupportedTokenPair",
    message:
      from === undefined
        ? "No route exists between these two tokens."
        : to === undefined
          ? `No route exists out of ${from.symbol}.`
          : `No route exists from ${from.symbol} to ${to.symbol}.`,
    ...args,
  };
}

/**
 * The intent cannot settle with a delay: the source has no redemption config,
 * the chain has no compressor, or the tail cannot serve the token asked for.
 **/
export interface NoDelayedRouteError extends IGearboxError {
  code: "noDelayedRoute";
  /** Absent where the error is the intent's, not the token's. */
  token?: Token;
}

/** {@inheritDoc NoDelayedRouteError} */
export function noDelayedRoute(token?: Token): NoDelayedRouteError {
  return {
    code: "noDelayedRoute",
    message:
      token === undefined
        ? "This request cannot be served as a delayed redemption."
        : `${token.symbol} cannot be served as a delayed redemption.`,
    ...(token === undefined ? {} : { token }),
  };
}

/** Several redemption venues for the source, and nothing says which. */
export interface MultipleDelayedWithdrawalsError extends IGearboxError {
  code: "multipleDelayedWithdrawals";
  token: Token;
  venues: number;
}

/** {@inheritDoc MultipleDelayedWithdrawalsError} */
export function multipleDelayedWithdrawals(
  token: Token,
  venues: number,
): MultipleDelayedWithdrawalsError {
  return {
    code: "multipleDelayedWithdrawals",
    message: `${token.symbol} has ${venues} redemption venues and none was named.`,
    token,
    venues,
  };
}

/** A redemption of the same asset is already in flight. */
export interface WithdrawalInProgressError extends IGearboxError {
  code: "withdrawalInProgress";
  /** The phantom token standing for the redemption already in flight. */
  inFlight: TokenAmount;
}

/** {@inheritDoc WithdrawalInProgressError} */
export function withdrawalInProgress(
  inFlight: TokenAmount,
): WithdrawalInProgressError {
  return {
    code: "withdrawalInProgress",
    message: `A redemption of ${inFlight.token.symbol} is already in flight on the account.`,
    inFlight,
  };
}

/**
 * The claim names no operation to resume: requested without an intent, or read
 * through a compressor too old to report one.
 **/
export interface NoRecordedIntentError extends IGearboxError {
  code: "noRecordedIntent";
}

/** {@inheritDoc NoRecordedIntentError} */
export function noRecordedIntent(): NoRecordedIntentError {
  return {
    code: "noRecordedIntent",
    message: "The claim names no operation to resume.",
  };
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

/** {@inheritDoc NoStrategyTargetCollateralError} */
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
 * No account at that address in the markets this SDK is connected to — closed
 * since it was listed, or read on the wrong chain.
 **/
export interface CreditAccountNotFoundError extends IGearboxError {
  code: "creditAccountNotFound";
  creditAccount: Address;
}

/** {@inheritDoc CreditAccountNotFoundError} */
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
 * The SDK could not answer at all: a read that failed, a chain it is not
 * connected to, a market or token address it knows nothing about, a contract
 * that reverted where nothing should, a bug of ours.
 *
 * The one code that is not a verdict on the request — everything above says
 * "this cannot be done", this one says "we do not know". It exists so that a
 * prepare method or a check always answers: what used to escape as an
 * exception arrives here instead, whole, under `cause`.
 **/
export interface UnexpectedFailureError extends IGearboxError {
  code: "unexpectedFailure";
  /** What actually went wrong, for a log and a bug report. */
  cause: Error;
}

/**
 * {@inheritDoc UnexpectedFailureError}
 *
 * Takes what was thrown, whatever that is: a `throw` is not obliged to raise an
 * `Error`, and `cause` promises one.
 **/
export function unexpectedFailure(
  thrown: unknown,
  action = "prepare this operation",
): UnexpectedFailureError {
  const cause = thrown instanceof Error ? thrown : new Error(String(thrown));
  return {
    code: "unexpectedFailure",
    message: `The SDK could not ${action}: ${cause.message}`,
    cause,
  };
}
