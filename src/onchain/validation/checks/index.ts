import type {
  CreditManagerPausedError,
  DebtOutOfRangeError,
  ForbiddenTokenError,
  InsufficientBalanceError,
  InsufficientCollateralError,
  InsufficientPoolLiquidityError,
  LeverageOutOfRangeError,
  MalformedTransactionError,
  MarketExpiredError,
  PoolPausedError,
  PoolSunsetError,
  QuotaCountExceededError,
  QuotaLimitReachedError,
} from "../../../model/index.js";

export * from "./checkBorrowLimit.js";
export * from "./checkCollateralised.js";
export * from "./checkCreditManagerPaused.js";
export * from "./checkDebtLimits.js";
export * from "./checkForbiddenToken.js";
export * from "./checkFunding.js";
export * from "./checkLeverage.js";
export * from "./checkMarketExpired.js";
export * from "./checkPoolPaused.js";
export * from "./checkPoolPayout.js";
export * from "./checkPoolSunset.js";
export * from "./checkPreviewError.js";
export * from "./checkQuotaCount.js";
export * from "./checkQuotaLimit.js";

/**
 * Everything the unit checks in this directory can produce.
 *
 * A convenience for the plumbing that carries any of them — `raise` in
 * particular. The union a caller is answered with is the narrower one its own
 * entrypoint spells out.
 **/
export type OperationCheckError =
  | CreditManagerPausedError
  | DebtOutOfRangeError
  | ForbiddenTokenError
  | InsufficientBalanceError
  | InsufficientCollateralError
  | InsufficientPoolLiquidityError
  | LeverageOutOfRangeError
  | MalformedTransactionError
  | MarketExpiredError
  | PoolPausedError
  | PoolSunsetError
  | QuotaCountExceededError
  | QuotaLimitReachedError;
