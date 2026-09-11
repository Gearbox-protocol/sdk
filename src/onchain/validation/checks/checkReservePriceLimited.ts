import type {
  Bps,
  ReservePriceLimitedError,
  TokenAmount,
} from "../../../model/index.js";
import { reservePriceLimited } from "../../../model/index.js";

export interface ReservePriceLimitedArgs {
  /** The safe-price factor, the one the collateral check compared. */
  healthFactor: Bps;
  /** The same account at the main feed. */
  atMainPrices: Bps;
  /** The lowest acceptable factor — a factor equal to it passes. */
  healthFactorThreshold: Bps;
  /** What the account can still take out, in the market's underlying. */
  withdrawable: TokenAmount;
}

/**
 * Whether a failed collateral check is the reserve price feed's doing.
 *
 * A call that hands funds over is weighed at safe prices — `min` of a token's
 * two feeds, and nothing at all where governance registered no reserve feed —
 * so an account that covers its debt at the main feed can still be refused.
 * The two are worth telling apart: a position that is genuinely too small is
 * fixed by adding collateral or requesting less, while this one is a valuation
 * the account does not control, and requesting less only helps as far as
 * `withdrawable` says it does.
 *
 * Runs after `checkCollateralised` and answers only when that one refused, so
 * the caller keeps its own threshold rather than restating it here.
 */
export function checkReservePriceLimited(
  args: ReservePriceLimitedArgs,
): ReservePriceLimitedError[] {
  const { healthFactor, atMainPrices, healthFactorThreshold, withdrawable } =
    args;
  // Under the threshold at both feeds: the reserve one is not what decided it.
  if (
    healthFactor >= healthFactorThreshold ||
    atMainPrices < healthFactorThreshold
  ) {
    return [];
  }
  return [
    reservePriceLimited({
      healthFactor,
      atMainPrices,
      healthFactorThreshold,
      withdrawable,
    }),
  ];
}
