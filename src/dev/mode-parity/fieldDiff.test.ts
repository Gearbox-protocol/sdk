import { describe, expect, it } from "vitest";
import {
  countPaths,
  type EntityFieldDiff,
  type FieldDiff,
  relativeDiffBps,
} from "./fieldDiff.js";
import { formatBpsAsPercent } from "./scriptUtils.js";

function numericDiff(
  path: string,
  onchain: unknown,
  offchain: unknown,
): FieldDiff {
  return { path, onchain, offchain, kind: "numeric" };
}

function entity(
  id: string,
  path: string,
  onchain: unknown,
  offchain: unknown,
  expected?: true,
): EntityFieldDiff {
  return {
    id,
    diff: {
      ...numericDiff(path, onchain, offchain),
      ...(expected
        ? { expected: true as const, reason: "tolerance" as const }
        : {}),
    },
  };
}

describe("relativeDiffBps", () => {
  it("returns the relative gap of two numbers in bps", () => {
    expect(relativeDiffBps(1_000, 1_050)).toBe((50 / 1_050) * 10_000);
    expect(relativeDiffBps(0, 0)).toBe(0);
  });

  it("computes bigint gaps in integer arithmetic", () => {
    expect(relativeDiffBps(1_000_000n, 1_010_000n)).toBe(99.009);
    expect(relativeDiffBps(10n ** 18n, 10n ** 18n + 10n ** 15n)).toBe(9.99);
  });

  it("returns undefined for non-numeric pairs", () => {
    expect(relativeDiffBps("a", "b")).toBeUndefined();
    expect(relativeDiffBps(1, 2n)).toBeUndefined();
    expect(relativeDiffBps(undefined, 1)).toBeUndefined();
  });
});

describe("countPaths", () => {
  it("keeps the largest unexpected and expected numeric gaps separately", () => {
    const counts = countPaths([
      entity("small", "value", 100, 101),
      entity("big", "value", 100, 120),
      entity("inside", "value", 100, 100.05, true),
      entity("name", "name", "a", "b"),
    ]);

    expect(counts.find(entry => entry.path === "value")).toEqual({
      path: "value",
      kinds: ["numeric"],
      count: 3,
      expected: 1,
      unexpected: 2,
      worstUnexpected: {
        id: "big",
        path: "value",
        bps: (20 / 120) * 10_000,
        onchain: 100,
        offchain: 120,
      },
      worstExpected: {
        id: "inside",
        path: "value",
        bps: (Math.abs(100 - 100.05) / 100.05) * 10_000,
        onchain: 100,
        offchain: 100.05,
      },
    });
    expect(
      counts.find(entry => entry.path === "name")?.worstUnexpected,
    ).toBeUndefined();
  });
});

describe("formatBpsAsPercent", () => {
  it("prints a relative bps gap as a percent", () => {
    expect(formatBpsAsPercent(12.5)).toBe("0.125%");
    expect(formatBpsAsPercent(100)).toBe("1%");
    expect(formatBpsAsPercent(0)).toBe("0%");
  });
});
