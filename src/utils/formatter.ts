import {
  LEVERAGE_DECIMALS,
  PERCENTAGE_FACTOR,
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

const limitPrecision = (n: bigint, p?: number) => {
  const notZero = n !== 0n;
  if (n <= 10n && notZero) {
    return 6;
  }
  if (n <= 100n && notZero) {
    return 5;
  }
  if (n <= 1000n && notZero) {
    return 4;
  }
  if (n <= 10000n && notZero) {
    return 3;
  }
  if (p === undefined && n > 10n ** 21n) {
    return 2;
  }
  if (p === undefined && n > 10n ** 24n) {
    return 0;
  }

  return p;
};

const limitNum = (n: bigint, d = 18): bigint => {
  let limited = n <= 2n ? 0n : n;
  if (d <= 6) {
    return limited * 10n ** BigInt(6 - d);
  } else {
    return limited / 10n ** BigInt(d - 6);
  }
};

export function formatBN(
  num: BigNumberish | undefined,
  decimals: number,
  precision?: number,
): string {
  if (num === undefined) return "-";

  const numBInt = toBigInt(num);
  // GUSD: 2 decimals
  const limitedNum = limitNum(numBInt, decimals);
  const limitedPrecision = limitPrecision(limitedNum, precision);
  return toHumanFormat(limitedNum, limitedPrecision);
}

export function formatBn4dig(num: bigint, precision = 2): string {
  if (precision > 6) {
    throw new Error("Precision is too high, try <= 6");
  }

  const numStr = num.toString();
  if (numStr.length <= 6) {
    const completed = "0".repeat(6 - numStr.length) + numStr;
    return `0.${completed.slice(0, precision)}`;
  }
  return `${numStr.slice(0, numStr.length - 6)}.${numStr.slice(
    numStr.length - 6,
    numStr.length - 6 + precision,
  )}`;
}

export function toHumanFormat(num: bigint, precision = 2): string {
  if (num >= BigInt(1e15)) {
    return `${formatBn4dig(num / BigInt(1e9), precision)}Bn`;
  }

  if (num >= BigInt(1e12)) {
    return `${formatBn4dig(num / BigInt(1e6), precision)}M`;
  }

  if (num >= BigInt(1e9)) {
    return `${formatBn4dig(num / BigInt(1e3), precision)}K`;
  }

  return formatBn4dig(num, precision);
}

export function toSignificant(num: bigint, decimals: number): string {
  if (num === 1n) return "0";
  const divider = new Decimal(10).toPower(decimals);
  const number = new Decimal(num.toString()).div(divider);
  return number.toSignificantDigits(6, 4).toString();
}

export const toBigInt = (v: BigNumberish): bigint => {
  const value =
    typeof v === "object" && (v as any).type === "BigNumber"
      ? (v as any).hex
      : v.toString();
  return BigInt(value);
};

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
