import { describe, expectTypeOf, it } from "vitest";
import type {
  DataResponse,
  HistorySeries,
  Opportunity,
  PoolHistoryMetric,
  PoolOpportunityRef,
  StrategyHistoryMetric,
  StrategyOpportunityRef,
} from "../../model/index.js";
import type { OffchainOpportunities } from "../../offchain/index.js";
import type { MultichainOpportunitiesService } from "../../sdk/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { Mode } from "../types.js";
import type { Opportunities } from "./types.js";

/**
 * Mode gates which methods exist, not what they return, so a call the mode
 * cannot serve has to fail at compile time. These assertions are the only thing
 * that proves it: nothing at runtime distinguishes the three shapes, because
 * one class implements all of them.
 **/

describe("mode gates method existence", () => {
  it("every mode reads what both sources can produce", () => {
    expectTypeOf<Opportunities<"onchain">>().toHaveProperty("list");
    expectTypeOf<Opportunities<"onchain">>().toHaveProperty("getPool");
    expectTypeOf<Opportunities<"onchain">>().toHaveProperty("getStrategy");
    expectTypeOf<Opportunities<"offchain">>().toHaveProperty("list");
    expectTypeOf<Opportunities<"both">>().toHaveProperty("list");
  });

  it("history exists only where a backend does", () => {
    expectTypeOf<Opportunities<"offchain">>().toHaveProperty("history");
    expectTypeOf<Opportunities<"both">>().toHaveProperty("history");
    expectTypeOf<Opportunities<"onchain">>().not.toHaveProperty("history");
  });

  it("a widened mode degrades to the base reads rather than to everything", () => {
    // consumers whose config object widens `mode` to `Mode` lose the gated
    // methods; they must not silently gain them
    expectTypeOf<Opportunities<Mode>>().toHaveProperty("list");
    expectTypeOf<Opportunities<Mode>>().not.toHaveProperty("history");
    expectTypeOf<Opportunities<Mode>>().not.toHaveProperty("merge");
  });

  it("filtering an already-read list exists in every mode", () => {
    expectTypeOf<Opportunities<"onchain">>().toHaveProperty("filter");
    expectTypeOf<Opportunities<"offchain">>().toHaveProperty("filter");
    expectTypeOf<Opportunities<"both">>().toHaveProperty("filter");
  });
});

describe("mode gates the source branches", () => {
  it("offers the branch of every source the mode reads", () => {
    expectTypeOf<
      Opportunities<"onchain">["onchain"]
    >().toEqualTypeOf<MultichainOpportunitiesService>();
    expectTypeOf<
      Opportunities<"offchain">["offchain"]
    >().toEqualTypeOf<OffchainOpportunities>();
    expectTypeOf<
      Opportunities<"both">["onchain"]
    >().toEqualTypeOf<MultichainOpportunitiesService>();
    expectTypeOf<
      Opportunities<"both">["offchain"]
    >().toEqualTypeOf<OffchainOpportunities>();
  });

  it("hides the branch of a source the mode does not read", () => {
    expectTypeOf<Opportunities<"onchain">>().not.toHaveProperty("offchain");
    expectTypeOf<Opportunities<"offchain">>().not.toHaveProperty("onchain");
  });

  it("merging exists only where there are two sources to merge", () => {
    expectTypeOf<Opportunities<"both">>().toHaveProperty("merge");
    expectTypeOf<Opportunities<"onchain">>().not.toHaveProperty("merge");
    expectTypeOf<Opportunities<"offchain">>().not.toHaveProperty("merge");
  });

  it("merges what the branches return, in either order of arrival", () => {
    const opportunities = {} as Opportunities<"both">;
    // a source still in flight is `undefined`, which is what keeps a merged
    // read pending rather than making it look empty
    expectTypeOf(opportunities.merge.list).toBeCallableWith(
      undefined,
      {} as DataResponse<Opportunity[]>,
    );
    expectTypeOf(opportunities.merge.list).toBeCallableWith(
      {} as DataResponse<Opportunity[]>,
      undefined,
    );
    expectTypeOf(opportunities.merge.list).returns.toEqualTypeOf<
      DataResponse<Opportunity[]> | undefined
    >();
  });
});

describe("the opportunity kind gates which charts it has", () => {
  const opportunities = {} as Opportunities<"both">;
  const pool = {} as PoolOpportunityRef;
  const strategy = {} as StrategyOpportunityRef;

  it("takes the metrics of the kind the key names", () => {
    expectTypeOf(opportunities.history(pool).chart)
      .parameter(0)
      .toEqualTypeOf<PoolHistoryMetric>();
    expectTypeOf(opportunities.history(strategy).chart)
      .parameter(0)
      .toEqualTypeOf<StrategyHistoryMetric>();
    expectTypeOf(opportunities.history(pool).chart).toBeCallableWith(
      "depositApy",
      "1m",
    );
    expectTypeOf(opportunities.history(strategy).chart).toBeCallableWith(
      "tvl",
      "1y",
    );
  });

  it("rejects a metric the other kind owns", () => {
    // @ts-expect-error `tvl` is a strategy metric
    opportunities.history(pool).chart("tvl", "1y");
    // @ts-expect-error `dieselRate` is a pool metric
    opportunities.history(strategy).chart("dieselRate", "1m");
  });

  it("answers with the series in the envelope every read uses", () => {
    expectTypeOf(
      opportunities.history(strategy).chart,
    ).returns.resolves.toEqualTypeOf<
      DataResponse<HistorySeries<StrategyHistoryMetric>>
    >();
  });
});

describe("mode gates the source escape hatches", () => {
  it("names the source the mode reads from", () => {
    expectTypeOf<
      GearboxSDK<"onchain">["offchain"]
    >().toEqualTypeOf<undefined>();
    expectTypeOf<
      GearboxSDK<"offchain">["onchain"]
    >().toEqualTypeOf<undefined>();
    expectTypeOf<
      GearboxSDK<"both">["onchain"]
    >().not.toEqualTypeOf<undefined>();
    expectTypeOf<
      GearboxSDK<"both">["offchain"]
    >().not.toEqualTypeOf<undefined>();
  });
});
