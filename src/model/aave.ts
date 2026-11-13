import type { Address } from "viem";
import type { StrategyPosition } from "./positions.js";
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

/**
 * A position that lives on Aave Horizon: the RWA the account owner supplied to
 * the Aave pool and the loan the Horizon bridge took against it in the owner's
 * name. The credit account it was built in stays open with no debt, and the
 * exit runs through such an account again. One pool holds one position per
 * owner, however many accounts moved into it.
 *
 * Shaped like {@link StrategyPosition} so the two are shown alike. The shared
 * fields mean what they mean there, read on Aave for the owner (the investor
 * of an RWA account):
 *
 * - `creditManager` and `creditAccount` are an account of the owner the exit
 *   can run through, not necessarily the one the position was built in;
 * - `collaterals` lists the RWA supplied to Aave in the RWA itself, not in its
 *   aToken, which Aave mints one for one; `quota` is always zero, since Aave
 *   charges none, and `withdrawals` is empty;
 * - `totalDebt` is the variable debt owed on Aave, and `totalValue` the
 *   collateral at the Aave oracle's prices, both in the underlying;
 * - `healthFactor` is Aave's, of everything the owner holds on the pool;
 * - `borrowApy` and `borrowRate` are the pool's variable borrow rate, with no
 *   quota part.
 **/
export interface AavePosition
  extends Omit<
    StrategyPosition,
    | "kind"
    | "borrowApyAvg7D"
    | "netApy"
    | "netApyAvg7D"
    | "borrowRateAvg7D"
    | "pnl"
    | "error"
  > {
  /**
   * Tells this position from a credit account; not one of the
   * {@link PositionKind}s `positions.list` returns.
   **/
  kind: "aave";
  /**
   * Aave pool the collateral is supplied to and the debt is owed on.
   **/
  pool: Address;
  /**
   * Horizon bridge that holds the owner's borrow delegation, see
   * {@link AaveBridgeBorrow}.
   **/
  bridge: Address;
}
