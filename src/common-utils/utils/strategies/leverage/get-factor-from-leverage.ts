import { LEVERAGE_DECIMALS } from "../../../../sdk/index.js";

export type LeverageFactor = bigint & { __brand: "leverageFactor" };

export function getFactorFromLeverage(leverage: bigint): bigint {
  return (leverage - LEVERAGE_DECIMALS) as LeverageFactor;
}
