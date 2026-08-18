import { isAddressEqual } from "viem";
import { DUST_THRESHOLD } from "../constants/math.js";
import {
  type CalcLiquidationPriceProps,
  calcLiquidationPriceForTarget,
} from "./calcLiquidationPriceForTarget.js";

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
  const { snapshot, underlying } = props;
  const targets = snapshot.assets.filter(
    a => a.balance > DUST_THRESHOLD && !isAddressEqual(a.token, underlying),
  );
  if (targets.length !== 1) {
    return null;
  }
  return calcLiquidationPriceForTarget({
    ...props,
    targetToken: targets[0].token,
  });
}
