import type { Address } from "viem";
import { LEVERAGE_DECIMALS, PERCENTAGE_FACTOR } from "../../../../sdk/index.js";

import { getFactorFromLeverage } from "./get-factor-from-leverage.js";
import { maxLeverageThreshold } from "./max-leverage-threshold.js";

/**
 * Max leverage factor (not leverage value) for a token across CMs.
 * Returns a factor where leverage = factor + LEVERAGE_DECIMALS.
 */
export function maxLeverage(
  lpToken: Address,
  cms: Array<{
    liquidationThresholds: Record<Address, bigint>;
    address: Address;
  }>,
  targetHF = PERCENTAGE_FACTOR,
): bigint {
  const [maxThreshold] = maxLeverageThreshold(lpToken, cms);
  const maxLeverageValue =
    (targetHF * LEVERAGE_DECIMALS) / (targetHF - maxThreshold);
  return getFactorFromLeverage(maxLeverageValue);
}
