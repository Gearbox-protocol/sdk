import type { Address } from "viem";
import type { Bps, Token, TokenAmount } from "../../model/index.js";
import type { BorrowLimitBinding, PreviewIssue } from "./refusal.js";

/**
 * Every verdict the protocol can pass on an operation, as values.
 *
 * Each check is handed the numbers it compares — never a suite, a market or an
 * SDK — so the engine, `checkOperation` and the strategy lists share one
 * implementation.
 *
 * Ladders stay with the caller because they differ deliberately: the engine
 * reports the tightest ceiling it found, the account-opening path the first one
 * exceeded in its own order.
 */

/** A factor at or below this is refused; kept for the callers that size on it. */
export const MIN_HF_LIMITED = 10100n;

/** The same bar as a `required` argument — the lowest factor that passes. */
export const MIN_HEALTH_FACTOR_FORM = 10_101;

/** The bar the facade itself enforces: an account may end exactly at 1.0. */
export const MIN_HEALTH_FACTOR_FACADE = 10_000;

/**
 * The safe-price bar a form holds an account to. A step above the facade's,
 * because a factor of exactly 1.0 at safe prices is already a refusal.
 */
export const MIN_SAFE_HEALTH_FACTOR_FORM = 10_001;

/** A refusal names what a limit was measured in, never what it is worth. */
export function amountOf(token: Token, value: bigint): TokenAmount {
  return { token, value, valueUsd: null };
}

/** The credit manager takes no multicall while it is paused. */
export function checkCreditManagerPaused(args: {
  isPaused: boolean;
  creditManager: Address;
}): PreviewIssue | null {
  if (!args.isPaused) {
    return null;
  }
  return {
    reason: "marketPaused",
    detail: { creditManager: args.creditManager },
  };
}

/** Past its expiration date the facade takes no more multicalls. */
export function checkMarketExpired(args: {
  isExpired: boolean;
  creditManager: Address;
  /** Unix seconds, as the facade reports it. */
  expirationDate: number;
}): PreviewIssue | null {
  if (!args.isExpired) {
    return null;
  }
  return {
    reason: "marketExpired",
    detail: {
      creditManager: args.creditManager,
      expirationDate: args.expirationDate,
    },
  };
}

/** A paused pool neither takes deposits nor pays out. */
export function checkPoolPaused(args: {
  isPaused: boolean;
  pool: Address;
}): PreviewIssue | null {
  return args.isPaused
    ? { reason: "marketPaused", detail: { pool: args.pool } }
    : null;
}

/**
 * A pool winding down still pays out, so only what puts money in is refused.
 */
export function checkPoolSunset(args: {
  isSunset: boolean;
  isDeposit: boolean;
  pool: Address;
}): PreviewIssue | null {
  return args.isSunset && args.isDeposit
    ? { reason: "poolSunset", detail: { pool: args.pool } }
    : null;
}

/**
 * What the pool will hand over, against what is asked for.
 *
 * `binding` and `available` are the caller's answer to "which ceiling stands in
 * the way", not this check's: see the ladder note above. `solutionAmount` is
 * the largest position still openable, left out when none is.
 */
export function checkBorrowLimit(args: {
  requested: bigint;
  available: bigint;
  binding: BorrowLimitBinding;
  underlying: Token;
  solutionAmount?: bigint;
}): PreviewIssue | null {
  if (args.requested <= args.available) {
    return null;
  }
  return {
    reason: "insufficientPoolLiquidity",
    detail: {
      requested: amountOf(args.underlying, args.requested),
      available: amountOf(args.underlying, args.available),
      binding: args.binding,
      ...(args.solutionAmount === undefined
        ? {}
        : { solutionAmount: amountOf(args.underlying, args.solutionAmount) }),
    },
  };
}

/**
 * What the pool can pay out, against what is being taken out.
 *
 * The operator is not `checkBorrowLimit`'s: a pool holding exactly the amount
 * asked for still cannot serve it, so equality is already a refusal. That is
 * the rule the legacy withdrawal validator enforced and it is preserved to the
 * unit.
 */
export function checkPoolPayout(args: {
  requested: bigint;
  available: bigint;
  underlying: Token;
}): PreviewIssue | null {
  if (args.requested < args.available) {
    return null;
  }
  return {
    reason: "insufficientPoolLiquidity",
    detail: {
      requested: amountOf(args.underlying, args.requested),
      available: amountOf(args.underlying, args.available),
      binding: "poolAvailableLiquidity",
    },
  };
}

/**
 * A debt the facade would revert on.
 *
 * `allowZero` is the one place the two callers genuinely disagree: an account
 * being adjusted may end owing nothing, while one being opened may not — so the
 * exemption is stated rather than assumed.
 */
export function checkDebtInBand(args: {
  debt: bigint;
  minDebt: bigint;
  maxDebt: bigint;
  underlying: Token;
  allowZero: boolean;
}): PreviewIssue | null {
  const { debt, minDebt, maxDebt, underlying, allowZero } = args;
  const outOfRange =
    debt > maxDebt || (debt < minDebt && !(allowZero && debt === 0n));
  if (!outOfRange) {
    return null;
  }
  return {
    reason: "debtOutOfRange",
    detail: {
      requested: amountOf(underlying, debt),
      minDebt: amountOf(underlying, minDebt),
      maxDebt: amountOf(underlying, maxDebt),
    },
  };
}

/** Leverage below 1x is not a position, it is a withdrawal. */
export function checkLeverageAtLeastOne(args: {
  leverage: bigint;
  min: bigint;
}): PreviewIssue | null {
  return args.leverage < args.min
    ? {
        reason: "leverageOutOfRange",
        detail: { requested: args.leverage, min: args.min },
      }
    : null;
}

/**
 * The account against its debt, at whichever bar the caller holds it to.
 *
 * An unread factor counts as failing: a check that cannot see the number is not
 * evidence that the number is fine.
 */
export function checkCollateralised(args: {
  healthFactor: Bps | undefined;
  /** The lowest acceptable factor — a factor equal to it passes. */
  required: Bps;
  safePrices: boolean;
  /**
   * The factor the account stands at now. Given, an operation that raises it
   * passes even from under the bar: an account already below is rescued by
   * exactly the top-ups a flat bar would refuse.
   */
  improvesFrom?: Bps;
}): PreviewIssue | null {
  const { healthFactor, required, safePrices, improvesFrom } = args;
  if (healthFactor === undefined) {
    return {
      reason: "insufficientCollateral",
      detail: { healthFactor: 0, required, safePrices },
    };
  }
  if (
    healthFactor >= required ||
    (improvesFrom !== undefined && healthFactor > improvesFrom)
  ) {
    return null;
  }
  return {
    reason: "insufficientCollateral",
    detail: { healthFactor, required, safePrices },
  };
}

/** A token the market will not let the account hold. */
export function checkForbiddenToken(args: {
  token: Token;
  isForbidden: boolean;
}): PreviewIssue | null {
  return args.isForbidden
    ? { reason: "forbiddenToken", detail: { token: args.token } }
    : null;
}

/**
 * The room the keeper still has for a token's quota, in the underlying.
 *
 * `requested` is absent for a token the market opened no quota for at all —
 * nothing was weighed against a limit, the token simply counts as no collateral.
 */
export function checkQuotaLimit(args: {
  token: Token;
  requested: bigint | undefined;
  available: bigint;
  underlying: Token;
}): PreviewIssue | null {
  const { token, requested, available, underlying } = args;
  if (requested !== undefined && requested <= available) {
    return null;
  }
  return {
    reason: "quotaLimitReached",
    detail: {
      token,
      requested:
        requested === undefined ? undefined : amountOf(underlying, requested),
      available: amountOf(underlying, available),
    },
  };
}

/** How many quoted tokens the facade enables at once. */
export function checkQuotaCount(args: {
  count: number;
  max: number;
}): PreviewIssue | null {
  return args.count > args.max
    ? {
        reason: "quotaCountExceeded",
        detail: { count: args.count, max: args.max },
      }
    : null;
}

/** What the operation is funded from, against what is there. */
export function checkFunding(args: {
  token: Token;
  required: bigint;
  held: bigint;
}): PreviewIssue | null {
  const { token, required, held } = args;
  if (required <= held) {
    return null;
  }
  return {
    reason: "insufficientSourceBalance",
    detail: {
      required: amountOf(token, required),
      held: amountOf(token, held),
    },
  };
}

/**
 * The SDK could not replay the transaction.
 *
 * Only the 1xxx class lands here. A 2xxx error says the transaction is fine and
 * the SDK could not fully evaluate it, which is a caveat on the numbers rather
 * than a reason to refuse — it stays on the preview for the caller to surface.
 */
export function checkPreviewError(
  error: { code: number; message: string } | undefined,
): PreviewIssue | null {
  if (!error || !isMalformedPreviewError(error)) {
    return null;
  }
  return {
    reason: "malformedTransaction",
    detail: error,
  };
}

/**
 * The class boundary the preview error codes are written against: 1xxx means
 * the transaction itself is malformed, 2xxx that only the evaluation was
 * incomplete. A range, so a future 1007 classifies itself.
 */
export function isMalformedPreviewError(error: { code: number }): boolean {
  return error.code >= 1000 && error.code < 2000;
}
