import { formatDuration as fmtDuration, intervalToDuration } from "date-fns";
import { LEVERAGE_DECIMALS, PERCENTAGE_FACTOR } from "../constants/index.js";

export const toBigInt = (
  v: string | number | bigint | { type: "BigNumber"; hex: string },
): bigint => {
  const value =
    typeof v === "object" && v.type === "BigNumber" ? v.hex : v.toString();
  return BigInt(value);
};

export const percentFmt = (v: number | bigint | string, raw = true): string =>
  `${(Number(v) / 100).toFixed(2)}%${raw ? ` [${v}]` : ""}`;

export function formatBNvalue(
  num: number | bigint | string | undefined,
  decimals: number,
  precision?: number,
  raw = true,
): string {
  return `${formatBN(num, decimals, precision)}${raw ? ` [ ${num} ]` : ""}`;
}

export function formatBN(
  num: number | bigint | string | undefined,
  decimals: number,
  precision?: number,
): string {
  if (num === undefined) {
    return "-";
  }
  const numBInt = BigInt(num);
  // GUSD: 2 decimals
  const limitedNum = limitNum(numBInt, decimals);
  const limitedPrecision = limitPrecision(limitedNum, precision);
  return toHumanFormat(limitedNum, limitedPrecision);
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
  const limited = n <= 2n ? 0n : n;
  if (d <= 6) {
    return limited * 10n ** BigInt(6 - d);
  } else {
    return limited / 10n ** BigInt(d - 6);
  }
};

function toHumanFormat(num: bigint, precision = 2): string {
  if (num >= BigInt(1e18)) {
    return `${formatBn4dig(num / BigInt(1e12), precision)}T`;
  }

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

function formatBn4dig(num: bigint, precision = 2): string {
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

export function fmtBinaryMask(mask: bigint): string {
  return mask.toString(2).padStart(64, "0");
}

export function numberWithCommas(x: number | bigint): string {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatDuration(seconds: number, raw = true): string {
  const now = Math.floor(Date.now() / 1_000) * 1_000;
  const start = new Date(now);
  const end = new Date(now + seconds * 1_000);
  const duration = intervalToDuration({ start, end });

  return `${fmtDuration(duration)}${raw ? `[${seconds.toString()}]` : ""}`;
}

export function formatNumberToString_(value: bigint | number): string {
  return value
    .toLocaleString("en-US", { minimumIntegerDigits: 1, useGrouping: true })
    .replaceAll(",", "_");
}

export function formatTimestamp(timestamp: number, raw = true): string {
  const result = new Date(timestamp * 1000).toLocaleString("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
  });
  return raw ? `${result} [${timestamp}]` : result;
}

type BigNumberish = bigint | number | string;

export function rayToNumber(num: BigNumberish): number {
  return Number(toBigInt(num) / 10n ** 21n) / 1000000;
}

export function toBN(num: string, decimals: number): bigint {
  if (num === "") return 0n;
  const negative = num.startsWith("-");
  const abs = negative ? num.slice(1) : num;
  const [intPart = "0", fracPart = ""] = abs.split(".");

  let frac = fracPart;
  let roundUp = false;
  if (frac.length > decimals) {
    roundUp = frac.charCodeAt(decimals) >= 53; // '5'
    frac = frac.slice(0, decimals);
  } else {
    frac = frac.padEnd(decimals, "0");
  }

  let result = BigInt(intPart + frac);
  if (roundUp) result += 1n;
  return negative ? -result : result;
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

function formatDecimalJsLikeToString(
  digits: string,
  base10exp: number,
): string {
  // digits is a non-empty string of decimal digits without leading/trailing zeros (unless "0").
  const len = digits.length;
  const isExp = base10exp <= -7 || base10exp >= 21;

  if (isExp) {
    let coeff = digits;
    if (len > 1) {
      coeff = `${digits[0]}.${digits.slice(1)}`;
    }
    const exp = base10exp;
    const expStr = exp < 0 ? `e${exp}` : `e+${exp}`;
    return `${coeff}${expStr}`;
  }

  if (base10exp < 0) {
    return `0.${"0".repeat(-base10exp - 1)}${digits}`;
  }

  if (base10exp >= len) {
    return `${digits}${"0".repeat(base10exp + 1 - len)}`;
  }

  const k = base10exp + 1;
  if (k === len) return digits;
  return `${digits.slice(0, k)}.${digits.slice(k)}`;
}

function roundToSignificantDigitsHalfUp(
  digits: string,
  base10exp: number,
  precision: number,
): { digits: string; base10exp: number } {
  if (precision < 1) {
    throw new Error(`Invalid precision: ${precision}`);
  }

  if (digits === "0") return { digits: "0", base10exp: 0 };

  // Normalize coefficient by trimming trailing zeros (decimal.js-light doesn't keep them).
  // The base-10 exponent belongs to the value, so it stays unchanged.
  let norm = digits;
  while (norm.length > 1 && norm.endsWith("0")) {
    norm = norm.slice(0, -1);
  }
  digits = norm;

  if (digits.length <= precision) {
    // No rounding needed; keep exponent as-is.
    return { digits, base10exp };
  }

  const cut = digits.slice(0, precision).split("");
  const next = digits.charCodeAt(precision) - 48; // 0..9

  if (next >= 5) {
    let i = cut.length - 1;
    while (i >= 0) {
      const cur = cut[i];
      if (cur === undefined) {
        throw new Error("roundToSignificantDigitsHalfUp: invalid state");
      }
      const d = cur.charCodeAt(0) - 48;
      if (d !== 9) {
        cut[i] = String.fromCharCode(48 + d + 1);
        break;
      }
      cut[i] = "0";
      i -= 1;
    }
    if (i < 0) {
      // overflow: 999.. -> 1000..
      cut.unshift("1");
      base10exp += 1;
    }
  }

  let rounded = cut.join("");

  // decimal.js-light internal representation does not preserve trailing zeros in the coefficient,
  // but the base-10 exponent is a property of the value itself, so it must not change here.
  let tz = 0;
  for (let i = rounded.length - 1; i >= 0 && rounded[i] === "0"; i -= 1) {
    tz += 1;
  }
  if (tz > 0) {
    rounded = rounded.slice(0, -tz);
  }
  if (rounded === "") {
    return { digits: "0", base10exp: 0 };
  }

  return { digits: rounded, base10exp };
}

export function toSignificant(
  num: bigint,
  decimals: number,
  precision = 6,
): string {
  // Preserve existing quirky behavior.
  if (num === 1n) return "0";
  if (num === 0n) return "0";

  const negative = num < 0n;
  const abs = negative ? -num : num;
  const rawDigits = abs.toString();

  // base10 exponent of abs * 10^-decimals
  const base10exp = rawDigits.length - decimals - 1;

  const rounded = roundToSignificantDigitsHalfUp(
    rawDigits,
    base10exp,
    precision,
  );
  const body = formatDecimalJsLikeToString(rounded.digits, rounded.base10exp);
  return negative ? `-${body}` : body;
}
