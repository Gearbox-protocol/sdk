import { SLIPPAGE_DECIMALS, toBigInt } from "../../../../sdk/index.js";

export function calculateLossCoefficient(
  slippage: number,
  constantLoss = 30n,
): bigint {
  return 100n * SLIPPAGE_DECIMALS - toBigInt(slippage) - constantLoss;
}
