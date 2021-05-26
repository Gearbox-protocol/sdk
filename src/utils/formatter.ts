import { BigNumber, BigNumberish } from "ethers";
import { PERCENTAGE_FACTOR, RAY } from "../core/constants";
import Decimal from "decimal.js-light";


export function rayToNumber(num: BigNumberish) : number {
  return BigNumber.from(num).div(BigNumber.from(10).pow(21)).toNumber() / 1000000
}

export function formatRAY(num?: BigNumber): string {
  return toSignificant(num || BigNumber.from(0), 27);
}

export function formatBN(
  num: BigNumberish | undefined,
  decimals: number,
  precision?: number
): string {
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

  const number =
    Math.floor(
      BigNumber.from(num)
        .div(BigNumber.from(10).pow((decimals || 18) - 4))
        .toNumber()
    ) / 10000;

  return toHumanFormat(number);
}

export function toHumanFormat(num: number): string {
  const round = (n: number) => (Math.floor(100 * n) / 100).toFixed(2);

  if (num > 1e9) {
    return round(num / 1e9) + "Bn";
  }

  if (num > 1e7) {
    return round(num / 1e6) + "M";
  }

  if (num > 1e4) {
    return round(num / 1e3) + "K";
  }

  return round(num);
}

export function toSignificant(num: BigNumber,  decimals: number) : string {
  if (num.toString() === "1") return "0"
  const divider = (new Decimal(10)).toPower(decimals)
  const number = (new Decimal(num.toString())).div(divider)
  return number.toSignificantDigits(6, 4).toString()
}

export function toBN(num: string, decimals: number): BigNumber {
  if (num === "") return BigNumber.from(0);
  const multiplier = (new Decimal(10)).toPower(decimals)
  const number = (new Decimal(num)).mul(multiplier)
  return BigNumber.from(number.toFixed(0));
}

export function shortAddress(address?: string): string {
  return address === undefined
    ? ""
    : `${address.substr(0, 6)}...${address.substr(38, 4)}`;
}

export const formatRate = (rate: BigNumberish | undefined) =>
  rate
    ? (
        BigNumber.from(rate)
          .mul(PERCENTAGE_FACTOR)
          .mul(100)
          .div(RAY)
          .toNumber() / PERCENTAGE_FACTOR
      ).toFixed(2) + "%"
    : "0.00%";


export function formatDate(date: Date) : string {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2)
    month = '0' + month;
  if (day.length < 2)
    day = '0' + day;

  return [year, month, day].join('-');
}

export function formatHf(healthFactor: number) : string{
  return (healthFactor / 10000).toFixed(2)
}
