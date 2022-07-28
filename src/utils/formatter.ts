import { BigNumber, BigNumberish } from "ethers";
import Decimal from "decimal.js-light";
import { PERCENTAGE_FACTOR, RAY, LEVERAGE_DECIMALS } from "../core/constants";

export function rayToNumber(num: BigNumberish): number {
  return (
    BigNumber.from(num).div(BigNumber.from(10).pow(21)).toNumber() / 1000000
  );
}

export function formatRAY(num?: BigNumber): string {
  return toSignificant(num || BigNumber.from(0), 27);
}

export function formatBN(
  numArg: BigNumberish | undefined,
  decimals: number,
  precisionArg?: number
): string {
  let num = numArg;
  let precision = precisionArg;

  if (!num) return "-";

  // if (BigNumber.from(num).gt(BigNumber.from(10).pow(37))) {
  //   return "MAX";
  // }

  if (!precision && BigNumber.from(num).gt(BigNumber.from(10).pow(21))) {
    precision = 2;
  }

  if (!precision && BigNumber.from(num).gt(BigNumber.from(10).pow(24))) {
    precision = 0;
  }

  if (BigNumber.from(num).lte(2)) {
    num = BigNumber.from(0);
  }

  const number = BigNumber.from(num).div(
    BigNumber.from(10).pow((decimals || 18) - 6)
  );

  if (number.lte(10000) && !number.isZero()) {
    precision = 3;
  }

  if (number.lte(1000) && !number.isZero()) {
    precision = 4;
  }

  if (number.lte(100) && !number.isZero()) {
    precision = 5;
  }

  if (number.lte(10) && !number.isZero()) {
    precision = 6;
  }

  return toHumanFormat(number, precision);
}

export function formatBn4dig(num: BigNumber, precision: number = 2): string {
  if (precision > 6) throw new Error("Incorrect precision");

  let numStr = num.toString();
  if (numStr.length < 6) numStr = "0".repeat(6 - numStr.length) + numStr;
  return numStr.length <= 6
    ? `0.${numStr.slice(0, precision)}`
    : `${numStr.slice(0, numStr.length - 6)}.${numStr.slice(
        numStr.length - 6,
        numStr.length - 6 + precision
      )}`;
}

export function toHumanFormat(num: BigNumber, precision: number = 2): string {
  if (num.gte(1e15)) {
    return `${formatBn4dig(num.div(1e9), precision)}Bn`;
  }

  if (num.gte(1e12)) {
    return `${formatBn4dig(num.div(1e6), precision)}M`;
  }

  if (num.gte(1e9)) {
    return `${formatBn4dig(num.div(1e3), precision)}K`;
  }

  return formatBn4dig(num, precision);
}

export function toSignificant(num: BigNumber, decimals: number): string {
  if (num.toString() === "1") return "0";
  const divider = new Decimal(10).toPower(decimals);
  const number = new Decimal(num.toString()).div(divider);
  return number.toSignificantDigits(6, 4).toString();
}

export function toBN(num: string, decimals: number): BigNumber {
  if (num === "") return BigNumber.from(0);
  const multiplier = new Decimal(10).toPower(decimals);
  const number = new Decimal(num).mul(multiplier);
  return BigNumber.from(number.toFixed(0));
}

export function shortAddress(address?: string): string {
  return address === undefined
    ? ""
    : `${address.substr(0, 6)}...${address.substr(38, 4)}`;
}

export function shortHash(address?: string): string {
  return address === undefined ? "" : `${address.substr(0, 5)}...`;
}

export const formatRate = (rate: BigNumberish | undefined) =>
  rate
    ? `${(
        BigNumber.from(rate)
          .mul(PERCENTAGE_FACTOR)
          .mul(100)
          .div(RAY)
          .toNumber() / PERCENTAGE_FACTOR
      ).toFixed(2)}%`
    : "0.00%";

export function formatDate(date: Date): string {
  const d = new Date(date);
  let month = `${d.getMonth() + 1}`;
  let day = `${d.getDate()}`;
  const year = d.getFullYear();

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;

  return [year, month, day].join("-");
}

export function formatHf(healthFactor: number): string {
  return (healthFactor / 10000).toFixed(2);
}

export function formatLeverage(leverage: number, decimals: number = 2) {
  return (leverage / LEVERAGE_DECIMALS).toFixed(decimals);
}
