import { describe, expectTypeOf, it } from "vitest";
import type {
  DataResponse,
  HistorySeries,
  PoolPositionHistoryMetric,
  PoolPositionRef,
  Position,
  StrategyPositionHistoryMetric,
  StrategyPositionRef,
} from "../../model/index.js";
import type { OffchainPositions } from "../../offchain/index.js";
import type { MultichainPositionsService } from "../../sdk/index.js";
import type { Mode } from "../types.js";
import type { Positions } from "./types.js";

describe("mode gates method existence", () => {
  it("every mode lists what both sources can produce", () => {
    expectTypeOf<Positions<"onchain">>().toHaveProperty("list");
    expectTypeOf<Positions<"offchain">>().toHaveProperty("list");
    expectTypeOf<Positions<"both">>().toHaveProperty("list");
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
    // what survives widening is everything the map does not gate
    expectTypeOf<Positions<Mode>>().toHaveProperty("merge");
    expectTypeOf<Positions<Mode>>().toHaveProperty("onchain");
    expectTypeOf<Positions<Mode>>().toHaveProperty("offchain");
  });

  it("filtering an already-read list exists in every mode", () => {
    expectTypeOf<Positions<"onchain">>().toHaveProperty("filter");
    expectTypeOf<Positions<"offchain">>().toHaveProperty("filter");
    expectTypeOf<Positions<"both">>().toHaveProperty("filter");
  });

  it("narrows a list already read to a list, and a pending read to pending", () => {
    const positions = {} as Positions<"both">;
    const response = {} as DataResponse<Position[]>;
    const pending = {} as DataResponse<Position[]> | undefined;

    expectTypeOf(positions.filter(response)).toEqualTypeOf<
      DataResponse<Position[]>
    >();
    expectTypeOf(positions.filter(undefined)).toEqualTypeOf<undefined>();
    expectTypeOf(positions.filter(pending)).toEqualTypeOf<
      DataResponse<Position[]> | undefined
    >();
  });
});

describe("the source branches are not gated by mode", () => {
  // they are aliases of `sdk.onchain.positions` and `sdk.offchain.positions`,
  // which the mode already gates; the branch of a source the mode does not read
  // throws on access instead
  it("names both sources at their concrete types in every mode", () => {
    expectTypeOf<
      Positions<"onchain">["onchain"]
    >().toEqualTypeOf<MultichainPositionsService>();
    expectTypeOf<
      Positions<"onchain">["offchain"]
    >().toEqualTypeOf<OffchainPositions>();
    expectTypeOf<
      Positions<"offchain">["onchain"]
    >().toEqualTypeOf<MultichainPositionsService>();
    expectTypeOf<
      Positions<"offchain">["offchain"]
    >().toEqualTypeOf<OffchainPositions>();
    expectTypeOf<
      Positions<"both">["onchain"]
    >().toEqualTypeOf<MultichainPositionsService>();
    expectTypeOf<
      Positions<"both">["offchain"]
    >().toEqualTypeOf<OffchainPositions>();
  });

  it("offers merging in every mode, since a merger is total over an absent side", () => {
    expectTypeOf<Positions<"onchain">>().toHaveProperty("merge");
    expectTypeOf<Positions<"offchain">>().toHaveProperty("merge");
    expectTypeOf<Positions<"both">>().toHaveProperty("merge");
  });

  it("merges what the branches return, in either order of arrival", () => {
    const positions = {} as Positions<"both">;
    // a source still in flight is `undefined`, which is what keeps a merged
    // read pending rather than making it look empty
    expectTypeOf(positions.merge.list).toBeCallableWith(
      undefined,
      {} as DataResponse<Position[]>,
    );
  });

  it("answers a list merge definitely once either side has arrived", () => {
    const positions = {} as Positions<"both">;
    const response = {} as DataResponse<Position[]>;
    const pending = {} as DataResponse<Position[]> | undefined;

    // the merge serves whichever side it was given, so a consumer holding one
    // does not carry `?.` over a case the merge cannot produce
    expectTypeOf(positions.merge.list(response, response)).toEqualTypeOf<
      DataResponse<Position[]>
    >();
    expectTypeOf(positions.merge.list(response, undefined)).toEqualTypeOf<
      DataResponse<Position[]>
    >();
    expectTypeOf(positions.merge.list(undefined, response)).toEqualTypeOf<
      DataResponse<Position[]>
    >();
    // both sides may still be missing, which is the one pending case left
    expectTypeOf(positions.merge.list(pending, pending)).toEqualTypeOf<
      DataResponse<Position[]> | undefined
    >();
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

  it("answers with the series in the envelope every read uses", () => {
    expectTypeOf(
      positions.history(strategy).chart,
    ).returns.resolves.toEqualTypeOf<
      DataResponse<HistorySeries<StrategyPositionHistoryMetric>>
    >();
  });
});
