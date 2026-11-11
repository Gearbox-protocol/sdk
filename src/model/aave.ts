import type { AccountProjection } from "./previews.js";
import type { Timestamp, TokenAmount } from "./primitives.js";

/**
 * Where an opening lands once it has moved to Aave Horizon.
 *
 * An RWA collateral is minted asynchronously, so the leverage is built in a
 * Gearbox credit account first; once the mint settles, the minted collateral is
 * supplied to Aave, the Gearbox debt is refinanced there with the interest it
 * accrued in the meantime, and the credit account closes. This is that second
 * half — the account itself is described by the projection beside it.
 *
 * The shared fields mean what they mean on an {@link AccountProjection}, read
 * on Aave: `assets` is the collateral supplied there, `totalDebt` includes
 * {@link mintPeriodInterest}, and `netValue` is what the wallet ends up owning.
 **/
export interface AavePositionProjection
  extends Pick<
    AccountProjection,
    | "totalValue"
    | "totalDebt"
    | "netValue"
    | "assets"
    | "healthFactor"
    | "liquidationPrice"
    | "borrowRate"
    | "leverage"
  > {
  /**
   * Interest the Gearbox debt accrues while the mint settles, already part of
   * `totalDebt`.
   **/
  mintPeriodInterest: TokenAmount;
  /**
   * How long the mint takes to settle, in seconds.
   **/
  mintDuration: number;
  /**
   * Estimated unix seconds at which the position is live on Aave.
   **/
  estLiveAt: Timestamp;
}
