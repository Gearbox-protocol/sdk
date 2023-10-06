import {
  LEVERAGE_DECIMALS,
  PERCENTAGE_FACTOR,
  toBigInt,
} from "@gearbox-protocol/sdk-gov";
import { Decimal } from "decimal.js-light";
import { BigNumberish } from "ethers";
import { unix } from "moment";

export function rayToNumber(num: BigNumberish): number {
  return Number(toBigInt(num) / 10n ** 21n) / 1000000;
}

export function formatRAY(num = 0n): string {
  return toSignificant(num, 27);
}

export function toSignificant(num: bigint, decimals: number): string {
  if (num === 1n) return "0";
  const divider = new Decimal(10).toPower(decimals);
  const number = new Decimal(num.toString()).div(divider);
  return number.toSignificantDigits(6, 4).toString();
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

export function formatDate(date: Date): string {
  const d = new Date(date);
  let month = `${d.getMonth() + 1}`;
  let day = `${d.getDate()}`;
  const year = d.getFullYear();

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;

  return [year, month, day].join("-");
}

export function formatPercentage(healthFactor: number, decimals = 2): string {
  return (healthFactor / Number(PERCENTAGE_FACTOR)).toFixed(decimals);
}

export function formatLeverage(leverage: number, decimals = 2): string {
  return (leverage / Number(LEVERAGE_DECIMALS)).toFixed(decimals);
}

export function formatDateTime(timestamp: number): string {
  return `${unix(timestamp).format("Do MMM YYYY HH:mm")} UTC`;
}
