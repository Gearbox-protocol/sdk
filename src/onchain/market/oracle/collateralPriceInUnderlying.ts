import type { Address } from "viem";
import { PRICE_DECIMALS } from "../../constants/math.js";
import type { IPriceOracleContract } from "./types.js";

/**
 * What one unit of `collateral` costs in `underlying` right now, in the
 * oracle's 8-decimal (`PRICE_DECIMALS`) fixed point — the scale and the
 * denomination `calcLiquidationPrice` answers in, so the two figures are read
 * as a pair.
 *
 * Both sides come from the oracle's **main** feeds: this is the price the
 * market quotes, not the conservative one a hand-over is weighed at.
 *
 * `null` when the oracle cannot answer for either token, or prices the
 * underlying at zero — a screen shows a gap rather than a number derived from
 * a missing feed.
 **/
export function collateralPriceInUnderlying(
  oracle: IPriceOracleContract,
  collateral: Address,
  underlying: Address,
): bigint | null {
  try {
    const underlyingPrice = oracle.mainPrice(underlying);
    if (underlyingPrice <= 0n) {
      return null;
    }
    return (oracle.mainPrice(collateral) * PRICE_DECIMALS) / underlyingPrice;
  } catch {
    // The oracle throws for a token it has no successful answer for.
    return null;
  }
}
