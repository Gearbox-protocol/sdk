import { describe, expectTypeOf, it } from "vitest";
import type {
  ChartBundle,
  ChartSeries,
  DataResponse,
  Opportunity,
  PoolChartMetric,
  PoolOpportunityDetail,
  PoolOpportunityRef,
  StrategyOpportunityDetail,
  StrategyOpportunityRef,
} from "../../model/index.js";
import type { OffchainOpportunities } from "../../offchain/index.js";
import type { MultichainOpportunitiesService } from "../../sdk/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { Mode } from "../types.js";
import type { Opportunities } from "./types.js";

describe("mode gates method existence", () => {
  it("every mode reads what both sources can produce", () => {
    expectTypeOf<Opportunities<"onchain">>().toHaveProperty("list");
    expectTypeOf<Opportunities<"onchain">>().toHaveProperty("getPool");
    expectTypeOf<Opportunities<"onchain">>().toHaveProperty("getStrategy");
    expectTypeOf<Opportunities<"offchain">>().toHaveProperty("list");
    expectTypeOf<Opportunities<"both">>().toHaveProperty("list");
  });

  it("charts exist only where a backend does", () => {
    expectTypeOf<Opportunities<"offchain">>().toHaveProperty("charts");
    expectTypeOf<Opportunities<"both">>().toHaveProperty("charts");
    expectTypeOf<Opportunities<"onchain">>().not.toHaveProperty("charts");
  });

  it("a widened mode degrades to the base reads rather than to everything", () => {
    // consumers whose config object widens `mode` to `Mode` lose the gated
    // methods; they must not silently gain them
    expectTypeOf<Opportunities<Mode>>().toHaveProperty("list");
    expectTypeOf<Opportunities<Mode>>().not.toHaveProperty("charts");
    // what survives widening is everything the map does not gate
    expectTypeOf<Opportunities<Mode>>().toHaveProperty("merge");
    expectTypeOf<Opportunities<Mode>>().toHaveProperty("onchain");
    expectTypeOf<Opportunities<Mode>>().toHaveProperty("offchain");
  });

  it("filtering an already-read list exists in every mode", () => {
    expectTypeOf<Opportunities<"onchain">>().toHaveProperty("filter");
    expectTypeOf<Opportunities<"offchain">>().toHaveProperty("filter");
    expectTypeOf<Opportunities<"both">>().toHaveProperty("filter");
  });

  it("narrows a list already read to a list, and a pending read to pending", () => {
    const opportunities = {} as Opportunities<"both">;
    const response = {} as DataResponse<Opportunity[]>;
    const pending = {} as DataResponse<Opportunity[]> | undefined;

    expectTypeOf(opportunities.filter(response)).toEqualTypeOf<
      DataResponse<Opportunity[]>
    >();
    expectTypeOf(opportunities.filter(undefined)).toEqualTypeOf<undefined>();
    expectTypeOf(opportunities.filter(pending)).toEqualTypeOf<
      DataResponse<Opportunity[]> | undefined
    >();
  });
});

describe("the source branches are not gated by mode", () => {
  // they are aliases of `sdk.onchain.opportunities` and
  // `sdk.offchain.opportunities`, which the mode already gates; the branch of a
  // source the mode does not read throws on access instead
  it("names both sources at their concrete types in every mode", () => {
    expectTypeOf<
      Opportunities<"onchain">["onchain"]
    >().toEqualTypeOf<MultichainOpportunitiesService>();
    expectTypeOf<
      Opportunities<"onchain">["offchain"]
    >().toEqualTypeOf<OffchainOpportunities>();
    expectTypeOf<
      Opportunities<"offchain">["onchain"]
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

  it("offers merging in every mode, since a merger is total over an absent side", () => {
    expectTypeOf<Opportunities<"onchain">>().toHaveProperty("merge");
    expectTypeOf<Opportunities<"offchain">>().toHaveProperty("merge");
    expectTypeOf<Opportunities<"both">>().toHaveProperty("merge");
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
  });

  it("answers a list merge definitely once either side has arrived", () => {
    const opportunities = {} as Opportunities<"both">;
    const response = {} as DataResponse<Opportunity[]>;
    const pending = {} as DataResponse<Opportunity[]> | undefined;

    // the merge serves whichever side it was given, so a consumer holding one
    // does not carry `?.` over a case the merge cannot produce
    expectTypeOf(opportunities.merge.list(response, response)).toEqualTypeOf<
      DataResponse<Opportunity[]>
    >();
    expectTypeOf(opportunities.merge.list(response, undefined)).toEqualTypeOf<
      DataResponse<Opportunity[]>
    >();
    expectTypeOf(opportunities.merge.list(undefined, response)).toEqualTypeOf<
      DataResponse<Opportunity[]>
    >();
    // both sides may still be missing, which is the one pending case left
    expectTypeOf(opportunities.merge.list(pending, pending)).toEqualTypeOf<
      DataResponse<Opportunity[]> | undefined
    >();
  });

  it("keeps a detail merge optional, since either source may have failed it", () => {
    const opportunities = {} as Opportunities<"both">;
    const pool = {} as DataResponse<PoolOpportunityDetail>;
    const strategy = {} as DataResponse<StrategyOpportunityDetail>;

    // unlike a list, one entity has nothing to fall back to when neither source
    // served it, however it was asked
    expectTypeOf(opportunities.merge.pool(pool, pool)).toEqualTypeOf<
      DataResponse<PoolOpportunityDetail> | undefined
    >();
    expectTypeOf(
      opportunities.merge.strategy(strategy, strategy),
    ).toEqualTypeOf<DataResponse<StrategyOpportunityDetail> | undefined>();
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

describe("the opportunity kind gates which charts it has", () => {
  const opportunities = {} as Opportunities<"both">;
  const backend = {} as OffchainOpportunities;
  const pool = {} as PoolOpportunityRef;
  const strategy = {} as StrategyOpportunityRef;

  it("takes the metrics of the kind the key names", () => {
    expectTypeOf(
      opportunities.charts(pool, ["depositApy"], "1m"),
    ).resolves.toExtend<DataResponse<ChartBundle<readonly ["depositApy"]>>>();
    expectTypeOf(
      opportunities.charts(strategy, ["tvl", "netApy"], "1y"),
    ).resolves.toExtend<
      DataResponse<ChartBundle<readonly ["tvl", "netApy"]>>
    >();
  });

  it("rejects a metric the other kind owns", () => {
    // @ts-expect-error `tvl` is a strategy metric
    opportunities.charts(pool, ["tvl"], "1y");
    // @ts-expect-error `dieselRate` is a pool metric
    opportunities.charts(strategy, ["netApy", "dieselRate"], "1m");
    // The source escape hatch preserves the same constraint.
    // @ts-expect-error `tvl` is a strategy metric
    backend.getCharts(pool, ["tvl"], "1y");
  });

  it("keys the bundle by the metrics that were asked for, and no others", async () => {
    const { data } = await opportunities.charts(
      strategy,
      ["tvl", "netApy"],
      "1m",
    );

    expectTypeOf(data.series.tvl).toEqualTypeOf<ChartSeries>();
    expectTypeOf(data.series.netApy).toEqualTypeOf<ChartSeries>();
    // @ts-expect-error the read named `tvl` and `netApy`, so nothing else is keyed
    data.series.borrowApy;
  });

  it("makes keys optional when the metric list is dynamic", async () => {
    const metrics: PoolChartMetric[] = ["depositApy"];
    const { data } = await opportunities.charts(pool, metrics, "1m");

    expectTypeOf(data.series.depositApy).toEqualTypeOf<
      ChartSeries | undefined
    >();
  });
});
