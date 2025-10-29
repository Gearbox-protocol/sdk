import { json_parse } from "../../sdk/utils/index.js";

export function formatBytecodeSize(size: number) {
  return `${(size / 1024).toFixed(2)} KB`;
}

export function formatBytecodeVersion(version: number) {
  if (version === 0) return "-";
  const major = Math.floor(version / 100);
  const minor = Math.floor((version % 100) / 10);
  const patch = version % 10;
  return `v${major}.${minor}.${patch}`;
}

export function formatTimestamp(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleString("en-GB", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export function shortenHash(hash: string, chars: number = 4): string {
  if (!hash) return "";
  const start = hash.slice(0, chars + 2); // +2 for '0x' prefix
  const end = hash.slice(-chars);
  return `${start}...${end}`;
}

export function convertPercent(percent: number) {
  return Math.floor(percent * 100);
}

export function significantTrunc(x: number) {
  if (x === 0) return "0";
  if (x >= 1) return x.toFixed(0);

  const str = x.toPrecision(2);

  if (str.includes("e")) {
    const value = Number(str);
    return value.toFixed(20).replace(/\.?0+$/, "");
  }

  return str.replace(/\.?0+$/, "");
}

export function deepJsonParse(value: unknown): unknown {
  if (typeof value === "string") {
    try {
      const parsed = json_parse(value);
      if (parsed === value) return value;
      return deepJsonParse(parsed);
    } catch {
      return value;
    }
  }
  if (Array.isArray(value)) {
    return value.map(deepJsonParse);
  }
  if (typeof value === "object" && value !== null) {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = deepJsonParse(v);
    }
    return result;
  }
  return value;
}
