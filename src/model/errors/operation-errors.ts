import type { Address } from "viem";
import type { MalformedPreviewError } from "../previews.js";
import type { Bps, Token, TokenAmount } from "../primitives.js";
import type { IGearboxError } from "./base.js";

/**
 * Which limit stopped a borrow.
 *
 * - `poolAvailableLiquidity` — the pool's available liquidity
 * - `managerDebtAvailable` — this credit manager's remaining debt allowance
 * - `maxDebt` — the facade's per-account `debtLimits.maxDebt`
 * - `debtPerBlockLimit` — facade takes no new debt this block; in practice
 *   `maxDebtPerBlockMultiplier == 0` after a with-loss liquidation
 * - `poolDebtLimit` — pool-wide debt cap; used on account-opening only
 **/
export type BorrowLimitCause =
  | "poolAvailableLiquidity"
  | "managerDebtAvailable"
  | "maxDebt"
  | "debtPerBlockLimit"
  | "poolDebtLimit";

/**
 * The credit manager is paused and takes no multicall at all.
 **/
export interface CreditManagerPausedError extends IGearboxError {
  code: "creditManagerPaused";
  creditManager: Address;
}

/** {@inheritDoc CreditManagerPausedError} */
export function creditManagerPaused(
  creditManager: Address,
): CreditManagerPausedError {
  return {
    code: "creditManagerPaused",
    message: `Credit manager ${creditManager} is paused.`,
    creditManager,
  };
}

/**
 * The pool is paused: it neither takes deposits nor pays out.
 **/
export interface PoolPausedError extends IGearboxError {
  code: "poolPaused";
  pool: Address;
}

/** {@inheritDoc PoolPausedError} */
export function poolPaused(pool: Address): PoolPausedError {
  return {
    code: "poolPaused",
    message: `Pool ${pool} is paused.`,
    pool,
  };
}

/**
 * The facade is past its expiration date and takes no more multicalls.
 **/
export interface MarketExpiredError extends IGearboxError {
  code: "marketExpired";
  creditManager: Address;
  /** Unix seconds, as the facade reports it. */
  expirationDate: number;
}

/** {@inheritDoc MarketExpiredError} */
export function marketExpired(
  creditManager: Address,
  expirationDate: number,
): MarketExpiredError {
  return {
    code: "marketExpired",
    message: `Credit manager ${creditManager} expired at ${expirationDate}.`,
    creditManager,
    expirationDate,
  };
}

/**
 * The pool is winding down: it still pays out, but takes no more deposits.
 **/
export interface PoolSunsetError extends IGearboxError {
  code: "poolSunset";
  pool: Address;
}

/** {@inheritDoc PoolSunsetError} */
export function poolSunset(pool: Address): PoolSunsetError {
  return {
    code: "poolSunset",
    message: `Pool ${pool} is winding down and takes no more deposits.`,
    pool,
  };
}

/**
 * The pool cannot lend what the operation asks for.
 **/
export interface InsufficientPoolLiquidityError extends IGearboxError {
  code: "insufficientPoolLiquidity";
  /** Both in the market's underlying. */
  requested: TokenAmount;
  available: TokenAmount;
  /**
   * Which limit ran out. See {@link BorrowLimitCause}.
   **/
  limit: BorrowLimitCause;
  /**
   * Largest debt a new position can still take, omitted when even `minDebt`
   * does not fit.
   **/
  maxBorrowAmount?: TokenAmount;
}

/** {@inheritDoc InsufficientPoolLiquidityError} */
export function insufficientPoolLiquidity(
  args: Omit<InsufficientPoolLiquidityError, "code" | "message">,
): InsufficientPoolLiquidityError {
  return {
    code: "insufficientPoolLiquidity",
    message: `The pool cannot lend ${args.requested.value} ${args.requested.token.symbol}: ${args.available.value} left, stopped by ${args.limit}.`,
    ...args,
  };
}

/**
 * The debt the operation implies falls outside the facade's `debtLimits`
 * (`minDebt`/`maxDebt`).
 **/
export interface DebtOutOfRangeError extends IGearboxError {
  code: "debtOutOfRange";
  /** All three in the market's underlying. */
  requested: TokenAmount;
  minDebt: TokenAmount;
  maxDebt: TokenAmount;
}

/** {@inheritDoc DebtOutOfRangeError} */
export function debtOutOfRange(
  args: Omit<DebtOutOfRangeError, "code" | "message">,
): DebtOutOfRangeError {
  const { requested, minDebt, maxDebt } = args;
  return {
    code: "debtOutOfRange",
    message:
      requested.value > maxDebt.value
        ? `Debt ${requested.value} exceeds maxDebt ${maxDebt.value}.`
        : `Debt ${requested.value} is below minDebt ${minDebt.value}.`,
    ...args,
  };
}

/**
 * The leverage asked for cannot be expressed as a plan at all.
 **/
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

/** {@inheritDoc LeverageOutOfRangeError} */
export function leverageOutOfRange(
  args: Omit<LeverageOutOfRangeError, "code" | "message"> = {},
): LeverageOutOfRangeError {
  const { requested, min } = args;
  return {
    code: "leverageOutOfRange",
    message:
      requested === undefined || min === undefined
        ? "The leverage asked for cannot be expressed as a plan."
        : `Target leverage ${requested} is below the floor of ${min}.`,
    ...args,
  };
}

/**
 * The account would end the operation owing more than its collateral is worth
 * under liquidation thresholds, which the facade refuses to allow.
 **/
export interface InsufficientCollateralError extends IGearboxError {
  code: "insufficientCollateral";
  /**
   * The factor that was compared, which for a call that hands funds over is
   * the safe-price one; `safePrices` says which, since a projection always
   * reports main prices.
   **/
  healthFactor: Bps;
  /**
   * The threshold it was weighed against — the facade's own `1.0` for a check
   * that asks whether the transaction lands, a form's higher threshold for one
   * that asks whether it is wise.
   **/
  healthFactorThreshold: Bps;
  safePrices: boolean;
}

/** {@inheritDoc InsufficientCollateralError} */
export function insufficientCollateral(
  args: Omit<InsufficientCollateralError, "code" | "message">,
): InsufficientCollateralError {
  return {
    code: "insufficientCollateral",
    message: `The account would end at a health factor of ${args.healthFactor}, below ${args.healthFactorThreshold}.`,
    ...args,
  };
}

/**
 * The operation would increase the balance of a token the market forbids.
 **/
export interface ForbiddenTokenError extends IGearboxError {
  code: "forbiddenToken";
  token: Token;
}

/** {@inheritDoc ForbiddenTokenError} */
export function forbiddenToken(token: Token): ForbiddenTokenError {
  return {
    code: "forbiddenToken",
    message: `${token.symbol} is forbidden in this market and the operation buys more of it.`,
    token,
  };
}

/**
 * The market takes no more quota for a token the operation wants to hold.
 **/
export interface QuotaLimitReachedError extends IGearboxError {
  code: "quotaLimitReached";
  /** The token whose quota is asked for. */
  token: Token;
  /**
   * In the **underlying**, which is what a quota is measured in. Absent for a
   * token the market opened no quota for at all — nothing was weighed against
   * a limit, the token simply counts as no collateral.
   **/
  requested: TokenAmount | undefined;
  available: TokenAmount;
}

/** {@inheritDoc QuotaLimitReachedError} */
export function quotaLimitReached(
  args: Omit<QuotaLimitReachedError, "code" | "message">,
): QuotaLimitReachedError {
  const { token, requested, available } = args;
  return {
    code: "quotaLimitReached",
    message:
      requested === undefined
        ? `${token.symbol} takes no quota in this market, so it counts as no collateral.`
        : `${token.symbol} has ${available.value} of quota left, the operation needs ${requested.value}.`,
    ...args,
  };
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

/** {@inheritDoc QuotaCountExceededError} */
export function quotaCountExceeded(
  count: number,
  max: number,
): QuotaCountExceededError {
  return {
    code: "quotaCountExceeded",
    message: `The account would hold ${count} quoted tokens, and the facade enables ${max} at once.`,
    count,
    max,
  };
}

/**
 * A balance is too small to fund the operation's step.
 *
 * One error for both sides of the question, since both state the same fact —
 * holder H lacks amount X of token T — and differ only in whose balance is
 * short.
 **/
export interface InsufficientBalanceError extends IGearboxError {
  code: "insufficientBalance";
  /**
   * Both absent where the operation was refused before any pair of amounts
   * existed, which is most of the sites that raise this. The `message` carries
   * the explanation in that case.
   **/
  required?: TokenAmount;
  held?: TokenAmount;
  /** Who is short of funds. Absent when planning never resolved one. */
  holderKind?: "wallet" | "creditAccount";
  /** The address short of funds, when known. */
  holder?: Address;
}

/** {@inheritDoc InsufficientBalanceError} */
export function insufficientBalance(
  args: Omit<InsufficientBalanceError, "code" | "message"> = {},
): InsufficientBalanceError {
  const { required, held } = args;
  return {
    code: "insufficientBalance",
    message:
      required === undefined || held === undefined
        ? "There is not enough to fund this operation."
        : `${required.value} of ${required.token.symbol} is needed and ${held.value} is held.`,
    ...args,
  };
}

/**
 * The transaction could not be replayed: it is malformed, and every field
 * derived from replayed balances is guesswork.
 **/
export interface MalformedTransactionError extends IGearboxError {
  code: "malformedTransaction";
  /**
   * The replay warning behind the refusal, whole — its own code and message,
   * plus whatever else it names. Kept under a field of its own because it
   * spells `code` and `message` the same way the envelope does.
   **/
  warning: MalformedPreviewError;
}

/** {@inheritDoc MalformedTransactionError} */
export function malformedTransaction(
  warning: MalformedPreviewError,
): MalformedTransactionError {
  return {
    code: "malformedTransaction",
    message: `The transaction could not be replayed: ${warning.message}`,
    warning,
  };
}
