import type { Address } from "viem";
import { PERCENTAGE_FACTOR } from "../../../../sdk/index.js";

import { BigIntMath } from "../../bigint-math.js";
import { calculateLossCoefficient } from "./calculate-loss-coefficient.js";
import type { LeverageFactor } from "./get-factor-from-leverage.js";
import { maxLeverage } from "./max-leverage.js";

const DEFAULT_LEVERAGE_CONSTANT_LOSS = 500n;

export function calculateMaxLeverageFactor({
  targetToken,
  slippage,
  creditManagers,
  constantLoss = DEFAULT_LEVERAGE_CONSTANT_LOSS,
  leverageLimit,
}: {
  targetToken: Address;
  slippage: number;
  creditManagers: Array<{
    liquidationThresholds: Record<Address, bigint>;
    address: Address;
  }>;
  constantLoss?: bigint;
  leverageLimit?: number;
}): LeverageFactor {
  const maxPossibleLeverage = maxLeverage(targetToken, creditManagers);

  const coefficient = calculateLossCoefficient(slippage, constantLoss);
  const maxLeverageValue =
    (BigInt(maxPossibleLeverage) * coefficient) / PERCENTAGE_FACTOR;

  const r =
    leverageLimit !== undefined
      ? BigIntMath.min(BigInt(leverageLimit), maxLeverageValue)
      : maxLeverageValue;

  return r as LeverageFactor;
}
