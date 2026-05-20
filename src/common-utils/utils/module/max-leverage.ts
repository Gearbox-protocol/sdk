import { LEVERAGE_DECIMALS, PERCENTAGE_FACTOR } from "@gearbox-protocol/sdk";
import {
  getFactorFromLeverage,
  maxLeverageThreshold,
} from "@gearbox-protocol/sdk/common-utils";
import type { Address } from "viem";
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
