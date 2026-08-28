import { type Address, isAddressEqual } from "viem";
import { DUST_THRESHOLD } from "../constants/math.js";
import {
  type CalcLiquidationPriceProps,
  calcLiquidationPriceForTarget,
} from "./calcLiquidationPriceForTarget.js";
import type { AccountSnapshot } from "./types.js";

/**
 * Liquidation price of an account state's target collateral, in the oracle's
 * 8-decimal (`PRICE_DECIMALS`) fixed point.
 *
 * As the frontend does, a liquidation price only exists when the account
 * holds exactly one non-dust non-underlying asset; otherwise `null`.
 **/
export function calcLiquidationPrice(
  props: CalcLiquidationPriceProps,
): bigint | null {
  const targetToken = soleNonUnderlyingCollateral(
    props.snapshot,
    props.underlying,
  );
  if (!targetToken) {
    return null;
  }
  return calcLiquidationPriceForTarget({ ...props, targetToken });
}

/**
 * The one collateral a liquidation price — and the current price beside it —
 * can be quoted for: the account's single non-dust, non-underlying asset.
 * `null` when it holds none or several, which is the case neither figure
 * exists for.
 **/
export function soleNonUnderlyingCollateral(
  snapshot: AccountSnapshot,
  underlying: Address,
): Address | null {
  const targets = snapshot.assets.filter(
    a => a.balance > DUST_THRESHOLD && !isAddressEqual(a.token, underlying),
  );
  return targets.length === 1 ? targets[0].token : null;
}
