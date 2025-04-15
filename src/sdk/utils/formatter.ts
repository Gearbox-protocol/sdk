import { formatDuration as fmtDuration, intervalToDuration } from "date-fns";

export const toBigInt = (
  v: string | number | bigint | { type: "BigNumber"; hex: string },
): bigint => {
  const value =
    typeof v === "object" && v.type === "BigNumber" ? v.hex : v.toString();
  return BigInt(value);
};

export const percentFmt = (v: number | bigint | string, raw = true): string =>
  `${(Number(v) / 100).toFixed(2)}%` + (raw ? ` [${v}]` : "");

export function formatBNvalue(
  num: number | bigint | string | undefined,
  decimals: number,
  precision?: number,
  raw = true,
): string {
  return `${formatBN(num, decimals, precision)}` + (raw ? ` [ ${num} ]` : "");
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
  let limited = n <= 2n ? 0n : n;
  if (d <= 6) {
    return limited * 10n ** BigInt(6 - d);
  } else {
    return limited / 10n ** BigInt(d - 6);
  }
};

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

  return `${fmtDuration(duration)}` + (raw ? `[${seconds.toString()}]` : "");
}

export function formatNumberToString_(value: bigint | number): string {
  return value
    .toLocaleString("en-US", { minimumIntegerDigits: 1, useGrouping: true })
    .replaceAll(",", "_");
}
