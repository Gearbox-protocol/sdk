import type { Address } from "viem";
import { describe, expectTypeOf, it } from "vitest";
import type {
  ChartBundle,
  ChartSeries,
  DataResponse,
  Opportunity,
  PoolOpportunityChartMetric,
  PoolOpportunityRef,
  StrategyOpportunityRef,
} from "../../model/index.js";
import type { IOffchainOpportunities } from "../../offchain/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type {
  DelayedStrategyPrepare,
  LpPrepare,
  StrategyRoutesPrepare,
} from "../prepare/index.js";
import type { Mode } from "../types.js";
import type { IOpportunities } from "./types.js";

const WALLET = "0xf0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0" as Address;

describe("mode gates method existence", () => {
  it("a widened mode degrades to the base reads rather than to everything", () => {
    // consumers whose config object widens `mode` to `Mode` lose the gated
    // methods; they must not silently gain them
    expectTypeOf<IOpportunities<Mode>>().toHaveProperty("list");
    expectTypeOf<IOpportunities<Mode>>().not.toHaveProperty("history");
    expectTypeOf<IOpportunities<Mode>>().not.toHaveProperty("prepare");
    expectTypeOf<IOpportunities<Mode>>().not.toHaveProperty("charts");
    // what survives widening is everything the map does not gate
    expectTypeOf<IOpportunities<Mode>>().toHaveProperty("merge");
    expectTypeOf<IOpportunities<Mode>>().not.toHaveProperty("onchain");
    expectTypeOf<IOpportunities<Mode>>().not.toHaveProperty("offchain");
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

describe("prepare quotes the delayed route with the instant one", () => {
  const prepare = {} as IOpportunities<"onchain">["prepare"];

  it("answers the LP flows outright, with no promise to await", () => {
    const pool = {} as PoolOpportunityRef;
    const params = { amount: 1_000n, wallet: WALLET };
    expectTypeOf(prepare.deposit(pool, params)).toEqualTypeOf<LpPrepare>();
  });

  it("carries the request half in the flow that can be interrupted", () => {
    // one call quotes both routes, so the delayed request is a branch of the
    // answer rather than a method of its own
    expectTypeOf<
      Extract<StrategyRoutesPrepare, { ok: true }>["delayed"]
    >().toEqualTypeOf<
      Extract<DelayedStrategyPrepare, { ok: true }> | undefined
    >();
  });
});

describe("reads narrow by what they were given", () => {
  it("narrows a list already read to a list, and a pending read to pending", () => {
    const opportunities = {} as IOpportunities<"both">;
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

  it("answers a list merge definitely once either side has arrived", () => {
    const opportunities = {} as IOpportunities<"both">;
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
});

describe("the opportunity kind gates which charts it has", () => {
  const opportunities = {} as IOpportunities<"both">;
  const backend = {} as IOffchainOpportunities;
  const pool = {} as PoolOpportunityRef;
  const strategy = {} as StrategyOpportunityRef;

  it("takes the metrics of the kind the key names", () => {
    expectTypeOf(
      opportunities.charts(pool, ["depositApy"], "1m"),
    ).resolves.toExtend<DataResponse<ChartBundle<readonly ["depositApy"]>>>();
    expectTypeOf(
      opportunities.charts(strategy, ["tvl", "quotaRate"], "1y"),
    ).resolves.toExtend<
      DataResponse<ChartBundle<readonly ["tvl", "quotaRate"]>>
    >();
  });

  it("rejects a metric the other kind owns", () => {
    // @ts-expect-error `tvl` is a strategy metric
    opportunities.charts(pool, ["tvl"], "1y");
    // @ts-expect-error `dieselRate` is a pool metric
    opportunities.charts(strategy, ["quotaRate", "dieselRate"], "1m");
    // The source escape hatch preserves the same constraint.
    // @ts-expect-error `tvl` is a strategy metric
    backend.getCharts(pool, ["tvl"], "1y");
  });

  it("keys the bundle by the metrics that were asked for, and no others", async () => {
    const { data } = await opportunities.charts(
      strategy,
      ["tvl", "quotaRate"],
      "1m",
    );

    expectTypeOf(data.series.tvl).toEqualTypeOf<ChartSeries>();
    expectTypeOf(data.series.quotaRate).toEqualTypeOf<ChartSeries>();
    // @ts-expect-error the read named `tvl` and `quotaRate`, so nothing else is keyed
    data.series.borrowApy;
  });

  it("makes keys optional when the metric list is dynamic", async () => {
    const metrics: PoolOpportunityChartMetric[] = ["depositApy"];
    const { data } = await opportunities.charts(pool, metrics, "1m");

    expectTypeOf(data.series.depositApy).toEqualTypeOf<
      ChartSeries | undefined
    >();
  });
});
