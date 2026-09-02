import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { ChainId, Timestamp } from "../../model/index.js";
import type { PrintableCompareReport } from "./scriptUtils.js";
import {
  evaluateCompareFailure,
  formatCompareMarkdown,
  writeGithubJobSummary,
} from "./scriptUtils.js";

const MAINNET = 1 as ChainId;

function counts(
  overrides: Partial<PrintableCompareReport["summary"]> = {},
): PrintableCompareReport["summary"] {
  return {
    onchainRows: 2,
    offchainRows: 2,
    matched: 2,
    identical: 2,
    clean: 2,
    differing: 0,
    onlyOnchain: 0,
    onlyOffchain: 0,
    byChain: [
      {
        chainId: MAINNET,
        onchainRows: 2,
        offchainRows: 2,
        matched: 2,
        identical: 2,
        clean: 2,
        differing: 0,
        onlyOnchain: 0,
        onlyOffchain: 0,
      },
    ],
    diffsByPath: [],
    ...overrides,
  };
}

function report(
  overrides: Partial<PrintableCompareReport> = {},
): PrintableCompareReport {
  return {
    backendUrl: "https://api.gear-dev.dev",
    summary: counts(),
    onchainChains: [
      {
        chainId: MAINNET,
        status: "success",
        source: "onchain",
        blockNumber: 1,
        timestamp: 1_700_000_000 as Timestamp,
      },
    ],
    offchainChains: [
      {
        chainId: MAINNET,
        status: "success",
        source: "offchain",
        blockNumber: 1,
        timestamp: 1_700_000_000 as Timestamp,
      },
    ],
    ...overrides,
  };
}

describe("evaluateCompareFailure", () => {
  it("returns nothing when the sources agree", () => {
    expect(evaluateCompareFailure(report())).toEqual([]);
  });

  it("fails when both sources produced no data", () => {
    expect(
      evaluateCompareFailure(
        report({
          summary: counts({
            onchainRows: 0,
            offchainRows: 0,
            matched: 0,
            identical: 0,
            clean: 0,
          }),
        }),
      ),
    ).toEqual(["both sources produced no data"]);
  });

  it("fails on unexpected diffs and membership gaps", () => {
    expect(
      evaluateCompareFailure(
        report({
          summary: counts({
            onchainRows: 3,
            offchainRows: 3,
            matched: 2,
            identical: 1,
            clean: 1,
            differing: 1,
            onlyOnchain: 1,
            onlyOffchain: 1,
          }),
        }),
      ),
    ).toEqual([
      "1 matched rows have unexpected diffs",
      "1 rows only onchain",
      "1 rows only offchain",
    ]);
  });

  it("fails when wallets failed to list", () => {
    expect(
      evaluateCompareFailure(report({ summary: counts({ walletsFailed: 2 }) })),
    ).toEqual(["2 wallets failed to list"]);
  });

  it("fails when a chain could not be read", () => {
    expect(
      evaluateCompareFailure(
        report({
          offchainChains: [
            {
              chainId: MAINNET,
              status: "error",
              source: "offchain",
              error: "timeout",
            },
          ],
        }),
      ),
    ).toEqual(["chain 1 failed on offchain: timeout"]);
  });
});

describe("formatCompareMarkdown", () => {
  it("marks a clean report as passed", () => {
    const markdown = formatCompareMarkdown("opportunities", report(), [
      "total: 2 onchain, 2 offchain",
    ]);
    expect(markdown).toContain("# opportunities compare");
    expect(markdown).toContain("**Passed**");
    expect(markdown).toContain("total: 2 onchain, 2 offchain");
    expect(markdown).toContain("| chain | onchain | offchain |");
  });

  it("lists failure reasons when the report is not clean", () => {
    const markdown = formatCompareMarkdown(
      "positions",
      report(),
      [],
      ["1 rows only onchain"],
    );
    expect(markdown).toContain("**Failed**");
    expect(markdown).toContain("- 1 rows only onchain");
  });
});

describe("writeGithubJobSummary", () => {
  const previous = process.env.GITHUB_STEP_SUMMARY;

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.GITHUB_STEP_SUMMARY;
    } else {
      process.env.GITHUB_STEP_SUMMARY = previous;
    }
  });

  it("is a no-op when GITHUB_STEP_SUMMARY is unset", () => {
    delete process.env.GITHUB_STEP_SUMMARY;
    writeGithubJobSummary("opportunities", report());
  });

  it("appends markdown when GITHUB_STEP_SUMMARY is set", async () => {
    const dir = await mkdtemp(join(tmpdir(), "parity-summary-"));
    const path = join(dir, "summary.md");
    process.env.GITHUB_STEP_SUMMARY = path;
    writeGithubJobSummary("opportunities", report());
    const written = await readFile(path, "utf8");
    expect(written).toContain("# opportunities compare");
    await rm(dir, { recursive: true });
  });
});
