import type {
  CreditManagerPausedError,
  DebtOutOfRangeError,
  ForbiddenTokenError,
  InsufficientBalanceError,
  InsufficientCollateralError,
  InsufficientPoolLiquidityError,
  LeverageOutOfRangeError,
  MarketExpiredError,
  MultipleDelayedWithdrawalsError,
  NoDelayedRouteError,
  NoRecordedIntentError,
  QuotaLimitReachedError,
  UnsupportedCollateralTokenError,
  UnsupportedTokenPairError,
  WithdrawalInProgressError,
} from "../../model/index.js";

/**
 * What the intents engine can raise: unit-check errors it runs, plus the
 * planning outcomes discovered mid-walk. Feeds prepare's per-method unions.
 *
 * Not a catch-all of every SDK error — pool paused/sunset and a malformed
 * transaction are `checkOperation`'s, not the engine's.
 **/
export type IntentValidationError =
  | CreditManagerPausedError
  | MarketExpiredError
  | InsufficientPoolLiquidityError
  | DebtOutOfRangeError
  | LeverageOutOfRangeError
  | InsufficientCollateralError
  | ForbiddenTokenError
  | QuotaLimitReachedError
  | InsufficientBalanceError
  | UnsupportedCollateralTokenError
  | UnsupportedTokenPairError
  | NoDelayedRouteError
  | MultipleDelayedWithdrawalsError
  | WithdrawalInProgressError
  | NoRecordedIntentError;

/**
 * Engine-internal throw: planners and guards raise one error object, and the
 * service boundary turns it into {@link SDKError}.
 **/
export class IntentPreviewError extends Error {
  readonly error: IntentValidationError;

  constructor(error: IntentValidationError, message?: string) {
    super(message ?? error.message);
    this.name = "IntentPreviewError";
    this.error = error;
  }

  /** The same wrap the checks hand out, with an optional engine-side sentence. */
  static of(
    error: IntentValidationError,
    message?: string,
  ): IntentPreviewError {
    return new IntentPreviewError(error, message);
  }
}

/**
 * Throws the first error a check found, with the sentence the engine logs for
 * it. An empty array is a pass.
 *
 * Returns normally when there is nothing to raise, so it cannot narrow a type
 * the way a bare `throw` does — a site that guards a value for the code below
 * it keeps throwing directly.
 **/
export function raise(
  errors: readonly IntentValidationError[],
  message: string,
): void {
  const [first] = errors;
  if (first) {
    throw IntentPreviewError.of(first, message);
  }
}
