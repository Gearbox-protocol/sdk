import Decimal from "decimal.js-light";

import { LEVERAGE_DECIMALS, PERCENTAGE_FACTOR } from "../../constants/index.js";
import { toBigInt } from "../../utils/index.js";

export type BigNumberish = bigint | number | string;

export function rayToNumber(num: BigNumberish): number {
  return Number(toBigInt(num) / 10n ** 21n) / 1000000;
}

export function toSignificant(
  num: bigint,
  decimals: number,
  precision = 6,
): string {
  if (num === 1n) return "0";
  const divider = new Decimal(10).toPower(decimals);
  const number = new Decimal(num.toString()).div(divider);
  return number.toSignificantDigits(precision, 4).toString();
}

export function toBN(num: string, decimals: number): bigint {
  if (num === "") return 0n;
  const multiplier = new Decimal(10).toPower(decimals);
  const number = new Decimal(num).mul(multiplier);
  return BigInt(number.toFixed(0));
}

export function shortAddress(address?: string): string {
  return address === undefined
    ? ""
    : `${address.slice(0, 6)}...${address.slice(address.length - 4)}`;
}

export function shortHash(address?: string): string {
  return address === undefined ? "" : `${address.slice(0, 5)}...`;
}

export function formatPercentage(healthFactor: number, decimals = 2): string {
  return (healthFactor / Number(PERCENTAGE_FACTOR)).toFixed(decimals);
}

export function formatLeverage(leverage: number, decimals = 2): string {
  return (leverage / Number(LEVERAGE_DECIMALS)).toFixed(decimals);
}
