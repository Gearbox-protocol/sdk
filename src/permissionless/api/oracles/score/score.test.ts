import { describe, expect, it } from "vitest";
import { factorOf, finalPrice, scoreOfFactor, worstOf } from "./formula.js";
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
  score: scoreOfFactor(factor),
});

describe("scoreOfFactor", () => {
  it("is 1 for a price that did not move", () => {
    expect(scoreOfFactor(1)).toBe(1);
  });

  it("is the move itself in between", () => {
    expect(scoreOfFactor(1.04)).toBeCloseTo(1.04);
    expect(scoreOfFactor(3)).toBe(3);
  });

  it("is 10 for the whole lie, and holds there past it", () => {
    expect(scoreOfFactor(10)).toBe(10);
    // Two legs of a composite on one provider: 10 × 10.
    expect(scoreOfFactor(100)).toBe(10);
  });

  it("counts a price driven down as far the same", () => {
    expect(scoreOfFactor(1 / 1.04)).toBeCloseTo(1.04);
    expect(scoreOfFactor(0.1)).toBeCloseTo(10);
  });

  it("has no score for a price that stopped answering", () => {
    expect(scoreOfFactor(null)).toBeNull();
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
  // reserve Chainlink alone. Chainlink ×10 moves the reserve and, the median
  // holding, not the main — so min() stays put. With the reserve on Chainlink
  // as well as the main's only leg, min() follows both up.
  it("holds when only one side moves", () => {
    const before = finalPrice(2000n, 2200n) as bigint;
    const after = finalPrice(2000n, 22000n);
    expect(scoreOfFactor(factorOf(before, after))).toBe(1);
  });

  it("breaks when both sides move", () => {
    const before = finalPrice(2000n, 2200n) as bigint;
    const after = finalPrice(20000n, 22000n);
    expect(scoreOfFactor(factorOf(before, after))).toBe(10);
  });
});

describe("worstOf", () => {
  it("scores by the group that moves the price furthest and names it", () => {
    const result = worstOf([
      impact("Redstone", 1),
      impact("Chainlink", 10, "both"),
      impact("Lido", 1.02),
    ]);
    expect(result.score).toBe(10);
    expect(result.worst?.group).toBe("Chainlink");
    expect(result.impacts.map(it => it.group)).toEqual([
      "Chainlink",
      "Lido",
      "Redstone",
    ]);
  });

  it("does not score a group the price stops answering under, but lists it last", () => {
    const result = worstOf([impact("Lido", null), impact("Chainlink", 1.03)]);
    expect(result.score).toBeCloseTo(1.03);
    expect(result.worst?.group).toBe("Chainlink");
    expect(result.impacts.map(it => it.group)).toEqual(["Chainlink", "Lido"]);
  });

  it("is 1 where no group moves the price", () => {
    expect(worstOf([]).score).toBe(1);
    expect(worstOf([impact("Lido", null)]).worst).toBeNull();
  });
});
