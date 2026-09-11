import type { Address } from "viem";
import type { MaxBorrowAmount } from "../../onchain/index.js";
import type { Bps, Token, TokenAmount } from "../primitives.js";
import type {
  RWAMissingOpenAccountRequirements,
  RWAOpenAccountRequirements,
  RWAProtocol,
} from "../rwa.js";
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
 * The pool is paused: it neither takes deposits nor serves withdrawals.
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
 * The pool is winding down: it still serves withdrawals, but takes no more deposits.
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
 * The pool cannot lend what the operation wants to borrow.
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
  /** What the market will really lend; absent where the raiser only throws. */
  maxBorrowAmount?: MaxBorrowAmount;
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
 * The same failure as {@link InsufficientCollateralError}, traced to the
 * reserve price feed rather than to the size of the position.
 *
 * A call that hands funds over is weighed at safe prices — `min` of a token's
 * two feeds, and nothing at all for collateral governance registered no
 * reserve feed for — so an account that covers its debt at the main feed can
 * still be refused. Worth its own code because the two call for opposite
 * words: an under-collateralised position is fixed by adding collateral or
 * requesting less, while this is a valuation the account does not control, and
 * requesting less only helps as far as {@link withdrawable} says it does.
 **/
export interface ReservePriceLimitedError extends IGearboxError {
  code: "reservePriceLimited";
  /** The safe-price factor the operation would have ended at. */
  healthFactor: Bps;
  /**
   * The same account at the main feed. Above {@link healthFactorThreshold} by
   * definition — that is what makes the reserve feed the thing in the way, and
   * the gap between the two is how far it marks the collateral down.
   **/
  atMainPrices: Bps;
  /** The threshold both were weighed against, the facade's own `1.0`. */
  healthFactorThreshold: Bps;
  /**
   * What the account can still take out under the same check, in the market's
   * underlying — the request to offer instead of the refused one. It is the
   * `safePartial` of `WithdrawCeilings`, from the same code that answers
   * `maxWithdraw`, so the two never disagree.
   *
   * `0n` says no partial withdrawal clears the threshold at all, and a smaller
   * request will not help: holding leverage flat scales collateral and debt
   * together, which leaves the safe-price factor exactly where it found it.
   * Such a position can still leave entirely — an exit settles the debt rather
   * than shrinking it, and a check with no debt to divide by refuses nothing.
   **/
  withdrawable: TokenAmount;
}

/** {@inheritDoc ReservePriceLimitedError} */
export function reservePriceLimited(
  args: Omit<ReservePriceLimitedError, "code" | "message">,
): ReservePriceLimitedError {
  return {
    code: "reservePriceLimited",
    message: `The reserve price feed values this collateral below what the operation pays out: the account covers its debt at ${args.atMainPrices} on the main feed and only ${args.healthFactor} at the reserve one, below ${args.healthFactorThreshold}.`,
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
  /** The token whose quota is increased. */
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
 * `owner` has not approved `spender` for what the operation pulls.
 **/
export interface InsufficientAllowanceError extends IGearboxError {
  code: "insufficientAllowance";
  owner: Address;
  spender: Address;
  /** The token rides inside, as on {@link InsufficientBalanceError}. */
  required: TokenAmount;
  /** What is approved today. */
  allowed: TokenAmount;
}

/** {@inheritDoc InsufficientAllowanceError} */
export function insufficientAllowance(
  args: Omit<InsufficientAllowanceError, "code" | "message">,
): InsufficientAllowanceError {
  return {
    code: "insufficientAllowance",
    message: `${args.required.value} of ${args.required.token.symbol} must be approved to ${args.spender}, ${args.allowed.value} is.`,
    ...args,
  };
}

/**
 * The RWA protocol still wants something from the borrower before this token
 * can be opened on.
 **/
export interface RWAOpenRequirementsError extends IGearboxError {
  code: "rwaOpenRequirementsNotMet";
  token: Token;
  creditManager: Address;
  protocol: RWAProtocol;
  /** Where the wallet completes registration with {@link protocol}. */
  registrationLink: string;
  /** Always present on the error. */
  requirements: RWAOpenAccountRequirements;
  /** Absent when only issuer-side registration is pending (or Midas greenlist). */
  missing?: RWAMissingOpenAccountRequirements;
}

/** {@inheritDoc RWAOpenRequirementsError} */
export function rwaOpenRequirementsNotMet(
  args: Omit<RWAOpenRequirementsError, "code" | "message">,
): RWAOpenRequirementsError {
  return {
    code: "rwaOpenRequirementsNotMet",
    message: `${args.protocol} still wants something from the borrower before ${args.token.symbol} can be opened on.`,
    ...args,
  };
}
