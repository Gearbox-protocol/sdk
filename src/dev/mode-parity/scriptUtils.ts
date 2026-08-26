import { type Logger, pino } from "pino";
import type { ChainMetadata } from "../../model/index.js";
import type { NetworkType } from "../../onchain/index.js";
import { getAlchemyUrl } from "../providers.js";
import type {
  ChainCompareCounts,
  CompareCounts,
  DiffPathCount,
  WorstDiff,
} from "./fieldDiff.js";

/**
 * Printed columns naming the largest numeric disagreement of one field.
 **/
interface WorstTableColumns {
  "max diff": string;
  "worst entity": string;
}

/**
 * Chains the compare scripts attach to.
 **/
export type ComparedNetwork =
  | "Mainnet"
  | "Monad"
  | "Plasma"
  | "Somnia"
  | "Etherlink";

export const NETWORKS: ComparedNetwork[] = [
  "Mainnet",
  "Monad",
  "Plasma",
  "Somnia",
  "Etherlink",
];

export const BACKEND_URL =
  process.env.BACKEND_URL ?? "https://api.gear-dev.dev";
export const TIMEOUT = 480_000;

/**
 * Totals both compare reports print.
 **/
export interface PrintableCompareSummary extends CompareCounts {
  byChain: ChainCompareCounts[];
  diffsByPath: DiffPathCount[];
}

/**
 * Per-source chain metadata both compare reports carry.
 **/
export interface PrintableCompareReport {
  backendUrl: string;
  summary: PrintableCompareSummary;
  onchainChains: ChainMetadata[];
  offchainChains: ChainMetadata[];
}

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is required to reach the chains this script reads`,
    );
  }
  return value;
}

export function rpcUrls(): Record<ComparedNetwork, string> {
  const alchemyKey = requireEnv("ALCHEMY_KEY");
  const alchemy = (network: NetworkType): string => {
    const url = getAlchemyUrl(network, alchemyKey);
    if (!url) {
      throw new Error(`Alchemy serves no URL for ${network}`);
    }
    return url;
  };
  return {
    Mainnet: alchemy("Mainnet"),
    Monad: alchemy("Monad"),
    Plasma: alchemy("Plasma"),
    Somnia: requireEnv("SOMNIA_PROVIDER"),
    Etherlink: requireEnv("ETHERLINK_PROVIDER"),
  };
}

export function createLogger(): Logger {
  return pino({
    level: process.env.LOG_LEVEL ?? "info",
    formatters: {
      bindings: () => ({}),
      level: label => ({ level: label }),
    },
  });
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Runs `fn` over `items` with at most `concurrency` in flight.
 **/
export async function mapPool<T>(
  items: readonly T[],
  concurrency: number,
  fn: (item: T) => Promise<void>,
): Promise<void> {
  let next = 0;
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (true) {
        const index = next;
        next += 1;
        if (index >= items.length) {
          return;
        }
        await fn(items[index] as T);
      }
    },
  );
  await Promise.all(workers);
}

/**
 * Formats a relative difference in bps as a percent, e.g. 12.5 → `"0.125%"`.
 **/
export function formatBpsAsPercent(bps: number): string {
  if (!Number.isFinite(bps)) {
    return "";
  }
  const percent = bps / 100;
  if (percent === 0) {
    return "0%";
  }
  const abs = Math.abs(percent);
  const formatted =
    abs >= 1
      ? trimTrailingZeros(percent.toFixed(3))
      : trimTrailingZeros(percent.toPrecision(4));
  return `${formatted}%`;
}

function trimTrailingZeros(value: string): string {
  return value.includes(".") ? value.replace(/\.?0+$/, "") : value;
}

function worstColumns(worst: WorstDiff | undefined): WorstTableColumns {
  return {
    "max diff": worst ? formatBpsAsPercent(worst.bps) : "",
    "worst entity": worst?.id ?? "",
  };
}

/**
 * Prints the shared membership table, the fields that differed most often,
 * and any chain that failed to answer.
 **/
export function printCompareSummary(
  noun: string,
  report: PrintableCompareReport,
  extraLines: string[] = [],
): void {
  const { summary } = report;
  console.log(`\n${noun} from ${report.backendUrl} vs the chain`);
  console.table(
    summary.byChain.map(chain => ({
      chain: chain.chainId,
      onchain: chain.onchainRows,
      offchain: chain.offchainRows,
      matched: chain.matched,
      identical: chain.identical,
      clean: chain.clean,
      differing: chain.differing,
      "only onchain": chain.onlyOnchain,
      "only offchain": chain.onlyOffchain,
    })),
  );
  for (const line of extraLines) {
    console.log(line);
  }

  const unexpected = summary.diffsByPath.filter(entry => entry.unexpected > 0);
  const expected = summary.diffsByPath.filter(
    entry => entry.unexpected === 0 && entry.expected > 0,
  );

  if (unexpected.length) {
    console.log("\nunexpected fields that differed most often:");
    console.table(
      unexpected.slice(0, 25).map(entry => ({
        field: entry.path,
        unexpected: entry.unexpected,
        expected: entry.expected,
        kinds: entry.kinds.join(", "),
        ...worstColumns(entry.worstUnexpected),
      })),
    );
  }

  if (expected.length) {
    console.log("\nexpected fields (mode-scoped, backend-preferred, or within tolerance):");
    console.table(
      expected.slice(0, 25).map(entry => ({
        field: entry.path,
        rows: entry.expected,
        kinds: entry.kinds.join(", "),
        ...worstColumns(entry.worstExpected),
      })),
    );
  }

  for (const chain of [...report.onchainChains, ...report.offchainChains]) {
    if (chain.status === "error") {
      console.log(
        `chain ${chain.chainId} failed on ${chain.source}:`,
        chain.error,
      );
    }
  }
}
