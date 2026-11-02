import { describe, expect, it } from "vitest";
import {
  factorOf,
  finalPrice,
  REVERT_SCORE,
  scoreOfFactor,
  worstOf,
} from "./formula.js";
import type { GroupImpact } from "./types.js";

const impact = (
  group: string,
  factor: number | null,
  reaches: GroupImpact["reaches"] = "main",
): GroupImpact => ({
  group,
  identified: true,
  feeds: [`${group} feed`],
  reaches,
  factor,
  ratioFactor: factor,
  score: scoreOfFactor(factor),
});

describe("scoreOfFactor", () => {
  it("scores 10 for a price that did not move", () => {
    expect(scoreOfFactor(1)).toBe(10);
  });

  it("keeps a 10 for a price a bound holds within a few percent", () => {
    expect(scoreOfFactor(1.02)).toBe(10);
  });

  it("scores 0 for the full lie, and past it", () => {
    expect(scoreOfFactor(5)).toBe(0);
    // Two legs of a composite on one provider: 5 × 5.
    expect(scoreOfFactor(25)).toBe(0);
  });

  it("scores 5 for half the lie on a log scale", () => {
    expect(scoreOfFactor(Math.sqrt(5))).toBe(5);
  });

  it("is symmetric: a price driven down as far scores the same", () => {
    expect(scoreOfFactor(1 / 5)).toBe(0);
    expect(scoreOfFactor(1 / Math.sqrt(5))).toBe(5);
  });

  it("scores a price that stopped answering at half marks", () => {
    expect(scoreOfFactor(null)).toBe(REVERT_SCORE);
  });
});

describe("finalPrice", () => {
  it("takes the lower of main and reserve", () => {
    expect(finalPrice(100n, 120n)).toBe(100n);
    expect(finalPrice(500n, 120n)).toBe(120n);
  });

  it("takes main alone where there is no reserve", () => {
    expect(finalPrice(500n, undefined)).toBe(500n);
  });

  it("has no price where a feed it needs does not answer", () => {
    expect(finalPrice(null, 100n)).toBeNull();
    expect(finalPrice(100n, null)).toBeNull();
  });
});

describe("the screenshot's case", () => {
  // Main a composite of Lido × a median of Chronicle, Redstone and Chainlink;
  // reserve Chainlink alone. Chainlink ×5 moves the reserve and, the median
  // holding, not the main — so min() stays put. With the reserve on Chainlink
  // as well as the main's only leg, min() follows both up.
  it("holds when only one side moves", () => {
    const before = finalPrice(2000n, 2200n) as bigint;
    const after = finalPrice(2000n, 11000n);
    expect(scoreOfFactor(factorOf(before, after))).toBe(10);
  });

  it("breaks when both sides move", () => {
    const before = finalPrice(2000n, 2200n) as bigint;
    const after = finalPrice(10000n, 11000n);
    expect(factorOf(before, after)).toBe(5);
    expect(scoreOfFactor(factorOf(before, after))).toBe(0);
  });
});

describe("worstOf", () => {
  it("scores by the most damaging group and names it", () => {
    const result = worstOf([
      impact("Redstone", 1),
      impact("Chainlink", 5, "both"),
      impact("Lido", 1.02),
    ]);
    expect(result.score).toBe(0);
    expect(result.worst?.group).toBe("Chainlink");
    expect(result.impacts.map(it => it.group)).toEqual([
      "Chainlink",
      "Lido",
      "Redstone",
    ]);
  });

  it("breaks a tie towards the group that moved the price further", () => {
    const result = worstOf([impact("A", 5), impact("B", 25)]);
    expect(result.worst?.group).toBe("B");
  });

  it("scores 10 where no source feeds the price", () => {
    const result = worstOf([]);
    expect(result.score).toBe(10);
    expect(result.worst).toBeNull();
  });
});
