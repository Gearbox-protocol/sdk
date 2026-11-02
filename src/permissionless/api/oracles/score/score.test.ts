import type { Address } from "viem";
import { describe, expect, it } from "vitest";
import { type ScoreSource, scoreMarket } from "./formula.js";

const MARKET = {
  market: "0x00000000000000000000000000000000000000aa" as Address,
  marketName: "WETH Market",
  marketConfigurator: "0x00000000000000000000000000000000000000bb" as Address,
  curatorName: "kpk",
};

const named = (name: string): ScoreSource => ({
  key: `group:${name}`,
  name,
  identified: true,
});

const unnamed = (target: string, name = "Some adapter"): ScoreSource => ({
  key: `contract:${target}`,
  name,
  identified: false,
});

function side(
  feed: string,
  contractType: string,
  sources: ScoreSource[],
): { feed: { feed: Address; name: string; contractType: string }; sources: ScoreSource[] } {
  return {
    feed: { feed: feed as Address, name: feed, contractType },
    sources,
  };
}

const COMPOSITE = "PRICE_FEED::COMPOSITE";
const BOUNDED = "PRICE_FEED::BOUNDED";
const WSTETH = "PRICE_FEED::WSTETH";

describe("scoreMarket", () => {
  it("scores 10 for independent sources with a bound", () => {
    const result = scoreMarket(
      MARKET,
      side("0x01", BOUNDED, [named("Chainlink")]),
      side("0x02", COMPOSITE, [named("Redstone")]),
    );
    expect(result.score).toBe(10);
    expect(result.reasons).toEqual([]);
    expect(result.unverified).toBe(false);
  });

  it("counts an LP feed as bounded", () => {
    const result = scoreMarket(
      MARKET,
      side("0x01", WSTETH, [named("Lido"), named("Chainlink")]),
      side("0x02", COMPOSITE, [named("Redstone")]),
    );
    expect(result.bounded).toBe(true);
    expect(result.score).toBe(10);
  });

  it("scores 8 when one source in three is shared", () => {
    const result = scoreMarket(
      MARKET,
      side("0x01", WSTETH, [named("Lido"), named("Chainlink")]),
      side("0x02", COMPOSITE, [named("Lido"), named("Redstone")]),
    );
    // Shared Lido of {Lido, Chainlink, Redstone}: one in three.
    expect(result.independence).toBeCloseTo(2 / 3);
    expect(result.score).toBe(8);
    expect(result.sharedSources).toEqual(["Lido"]);
  });

  it("names two shared sources of one provider once", () => {
    const aggregator = (group: string): ScoreSource => ({
      key: `group:${group}`,
      name: "Chainlink",
      identified: true,
    });
    const result = scoreMarket(
      MARKET,
      side("0x01", BOUNDED, [aggregator("eth-usd"), aggregator("steth-eth")]),
      side("0x02", COMPOSITE, [aggregator("eth-usd"), aggregator("steth-eth")]),
    );
    expect(result.reasons).toEqual(["main and reserve share Chainlink"]);
    expect(result.sharedSources).toEqual(["Chainlink"]);
  });

  it("scores 5 for independent sources without a bound", () => {
    const result = scoreMarket(
      MARKET,
      side("0x01", COMPOSITE, [named("Chainlink")]),
      side("0x02", COMPOSITE, [named("Redstone")]),
    );
    expect(result.score).toBe(5);
    expect(result.reasons).toEqual(["neither feed is bounded"]);
  });

  it("scores 4 for two feeds of the same provider with a bound", () => {
    const result = scoreMarket(
      MARKET,
      side("0x01", BOUNDED, [named("Chainlink")]),
      side("0x02", COMPOSITE, [named("Chainlink")]),
    );
    expect(result.independence).toBe(0);
    expect(result.score).toBe(4);
    expect(result.reasons).toEqual(["main and reserve share Chainlink"]);
  });

  it.each([
    ["no reserve at all", null, "no reserve feed"],
    [
      "a ZeroPriceFeed reserve",
      side("0x02", "PRICE_FEED::ZERO", []),
      "reserve is a ZeroPriceFeed",
    ],
    [
      "the main feed again",
      side("0x01", BOUNDED, [named("Chainlink")]),
      "reserve is the main feed",
    ],
  ])("scores 4 for %s with a bound", (_, reserve, reason) => {
    const result = scoreMarket(
      MARKET,
      side("0x01", BOUNDED, [named("Chainlink")]),
      reserve,
    );
    expect(result.hasReserve).toBe(false);
    expect(result.score).toBe(4);
    expect(result.reasons).toEqual([reason]);
  });

  it("scores 0 for no reserve and no bound", () => {
    const result = scoreMarket(
      MARKET,
      side("0x01", COMPOSITE, [named("Chainlink")]),
      null,
    );
    expect(result.score).toBe(0);
  });

  it("scores 0 for one provider and no bound", () => {
    const result = scoreMarket(
      MARKET,
      side("0x01", COMPOSITE, [named("Chainlink")]),
      side("0x02", COMPOSITE, [named("Chainlink")]),
    );
    expect(result.score).toBe(0);
  });

  it("counts an unnamed source as its own, and flags it", () => {
    const result = scoreMarket(
      MARKET,
      side("0x01", BOUNDED, [named("Chainlink")]),
      side("0x02", COMPOSITE, [unnamed("0xa1")]),
    );
    expect(result.score).toBe(10);
    expect(result.unverified).toBe(true);
  });

  it("treats the same unnamed contract on both sides as shared, unflagged", () => {
    const result = scoreMarket(
      MARKET,
      side("0x01", BOUNDED, [unnamed("0xa1")]),
      side("0x02", COMPOSITE, [unnamed("0xa1")]),
    );
    expect(result.independence).toBe(0);
    expect(result.score).toBe(4);
    expect(result.unverified).toBe(false);
  });

  it("does not merge two unnamed contracts that share a description", () => {
    const result = scoreMarket(
      MARKET,
      side("0x01", BOUNDED, [unnamed("0xa1", "X / USD")]),
      side("0x02", COMPOSITE, [unnamed("0xa2", "X / USD")]),
    );
    expect(result.independence).toBe(1);
    expect(result.unverified).toBe(true);
  });

  it("gives two hardcoded prices no independence", () => {
    const result = scoreMarket(
      MARKET,
      side("0x01", "PRICE_FEED::CONSTANT", []),
      side("0x02", "PRICE_FEED::CONSTANT", []),
    );
    expect(result.independence).toBe(0);
    expect(result.score).toBe(0);
    expect(result.reasons).toContain("neither feed reads a price source");
  });

  it("does not take a bound from a ZeroPriceFeed reserve", () => {
    const result = scoreMarket(
      MARKET,
      side("0x01", COMPOSITE, [named("Chainlink")]),
      side("0x02", "PRICE_FEED::ZERO", []),
    );
    expect(result.bounded).toBe(false);
    expect(result.score).toBe(0);
  });
});
