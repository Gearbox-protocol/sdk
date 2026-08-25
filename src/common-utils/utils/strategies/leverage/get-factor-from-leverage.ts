import { LEVERAGE_DECIMALS } from "../../../../onchain/index.js";

export type LeverageFactor = bigint & { __brand: "leverageFactor" };

export function getFactorFromLeverage(leverage: bigint): bigint {
  return (leverage - LEVERAGE_DECIMALS) as LeverageFactor;
}
