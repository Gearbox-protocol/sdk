import type { Address } from "viem";
import {
  LEVERAGE_DECIMALS,
  PERCENTAGE_FACTOR,
} from "../../../sdk/constants/math.js";

import { getFactorFromLeverage } from "../../utils/strategies/leverage/get-factor-from-leverage.js";
import { maxLeverageThreshold } from "../../utils/strategies/leverage/max-leverage-threshold.js";
import type { CreditManagerData } from "./types.js";

type PartialCM = Pick<CreditManagerData, "liquidationThresholds" | "address">;

export function maxLeverage(
  lpToken: Address,
  cms: Array<PartialCM>,
  // 1
  targetHF = PERCENTAGE_FACTOR,
) {
  const [maxThreshold] = maxLeverageThreshold(lpToken, cms);

  const maxLeverage =
    (targetHF * LEVERAGE_DECIMALS) / (targetHF - maxThreshold);
  return getFactorFromLeverage(maxLeverage);
}
