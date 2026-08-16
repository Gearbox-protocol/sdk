import { describe, expectTypeOf, it } from "vitest";
import type {
  PoolPositionHistoryMetric,
  PoolPositionRef,
  PositionList,
  StrategyPositionHistoryMetric,
  StrategyPositionRef,
} from "../../model/index.js";
import type { Mode, ReadResult } from "../types.js";
import type { Chart } from "../utils/index.js";
import type { Positions } from "./types.js";

/**
 * Mode gates which methods exist, not what they return, so a call the mode
 * cannot serve has to fail at compile time. These assertions are the only thing
 * that proves it: nothing at runtime distinguishes the three shapes, because
 * one class implements all of them.
 **/

describe("mode gates method existence", () => {
  it("every mode lists what both sources can produce", () => {
    expectTypeOf<Positions<"onchain">>().toHaveProperty("list");
    expectTypeOf<Positions<"offchain">>().toHaveProperty("list");
    expectTypeOf<Positions<"both">>().toHaveProperty("list");
  });

  it("returns positions together with their optional summary", () => {
    const positions = {} as Positions<"both">;
    expectTypeOf(
      positions.list("0x0000000000000000000000000000000000000000"),
    ).resolves.toEqualTypeOf<ReadResult<PositionList>>();
  });

  it("history exists only where a backend does", () => {
    expectTypeOf<Positions<"offchain">>().toHaveProperty("history");
    expectTypeOf<Positions<"both">>().toHaveProperty("history");
    expectTypeOf<Positions<"onchain">>().not.toHaveProperty("history");
  });

  it("a widened mode degrades to the base reads rather than to everything", () => {
    // consumers whose config object widens `mode` to `Mode` lose the gated
    // methods; they must not silently gain them
    expectTypeOf<Positions<Mode>>().toHaveProperty("list");
    expectTypeOf<Positions<Mode>>().not.toHaveProperty("history");
  });
});

describe("the position kind gates which charts it has", () => {
  const positions = {} as Positions<"both">;
  const pool = {} as PoolPositionRef;
  const strategy = {} as StrategyPositionRef;

  it("takes the metrics of the kind the key names", () => {
    expectTypeOf(positions.history(pool).chart)
      .parameter(0)
      .toEqualTypeOf<PoolPositionHistoryMetric>();
    expectTypeOf(positions.history(strategy).chart)
      .parameter(0)
      .toEqualTypeOf<StrategyPositionHistoryMetric>();
    expectTypeOf(positions.history(pool).chart).toBeCallableWith(
      "depositApy",
      "1m",
    );
    expectTypeOf(positions.history(strategy).chart).toBeCallableWith(
      "tvl",
      "1y",
    );
  });

  it("rejects a metric the other kind owns", () => {
    // @ts-expect-error `tvl` is a strategy metric
    positions.history(pool).chart("tvl", "1y");
    // @ts-expect-error `dieselRate` is a pool metric
    positions.history(strategy).chart("dieselRate", "1m");
  });

  it("answers with the points to draw and what annotates them", () => {
    expectTypeOf(
      positions.history(strategy).chart,
    ).returns.resolves.toEqualTypeOf<Chart>();
  });
});
