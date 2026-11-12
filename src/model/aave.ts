import type { Address } from "viem";
import type { AccountProjection } from "./previews.js";
import type { Timestamp, TokenAmount } from "./primitives.js";

/**
 * A loan the Horizon bridge takes on Aave as the credit account owner. Aave
 * lends it only up to what the owner delegated to the bridge on the variable
 * debt token of the borrowed token (`approveDelegation`).
 **/
export interface AaveBridgeBorrow {
  bridge: Address;
  amount: TokenAmount;
}

/**
 * Where an opening lands once it has moved to Aave Horizon.
 *
 * An RWA collateral may be minted asynchronously, so the leverage is built in a
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
   * How long the mint takes to settle, in seconds: the `withdrawalLength` of
   * the RWA's delayed operation, `0` where the opening mints it outright.
   **/
  mintDuration: number;
  /**
   * Estimated unix seconds at which the position is live on Aave. The
   * finalizer bot moves it a block after the mint settles at the earliest.
   **/
  estLiveAt: Timestamp;
  /**
   * Horizon bridge that borrows `totalDebt` as the owner when the position
   * moves, see {@link AaveBridgeBorrow}.
   **/
  bridge: Address;
}
