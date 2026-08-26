import type { Address } from "viem";
import { describe, expectTypeOf, it } from "vitest";
import type {
  ChartBundle,
  ChartSeries,
  DataResponse,
  Opportunity,
  PoolOpportunityChartMetric,
  PoolOpportunityDetail,
  PoolOpportunityRef,
  StrategyOpportunityDetail,
  StrategyOpportunityRef,
  StrategyPosition,
} from "../../model/index.js";
import type { OffchainOpportunities } from "../../offchain/index.js";
import type {
  ClaimableWithdrawal,
  MultichainOpportunitiesService,
} from "../../onchain/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type {
  DelayedStrategySimulate,
  LpSimulate,
  StrategyRoutesSimulate,
  StrategySimulate,
} from "../prepare/index.js";
import type { Mode } from "../types.js";
import type { Opportunities } from "./types.js";

const WALLET = "0xf0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0" as Address;

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

  it("totals exist only where a backend does", () => {
    expectTypeOf<Opportunities<"offchain">>().toHaveProperty("totals");
    expectTypeOf<Opportunities<"both">>().toHaveProperty("totals");
    expectTypeOf<Opportunities<"onchain">>().not.toHaveProperty("totals");
  });

  it("prepare and execute exist only where a chain does", () => {
    expectTypeOf<Opportunities<"onchain">>().toHaveProperty("prepare");
    expectTypeOf<Opportunities<"both">>().toHaveProperty("prepare");
    expectTypeOf<Opportunities<"offchain">>().not.toHaveProperty("prepare");
    expectTypeOf<Opportunities<"onchain">>().toHaveProperty("execute");
    expectTypeOf<Opportunities<"both">>().toHaveProperty("execute");
    expectTypeOf<Opportunities<"offchain">>().not.toHaveProperty("execute");
  });

  it("a widened mode degrades to the base reads rather than to everything", () => {
    // consumers whose config object widens `mode` to `Mode` lose the gated
    // methods; they must not silently gain them
    expectTypeOf<Opportunities<Mode>>().toHaveProperty("list");
    expectTypeOf<Opportunities<Mode>>().not.toHaveProperty("history");
    expectTypeOf<Opportunities<Mode>>().not.toHaveProperty("prepare");
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
});

describe("prepare covers the flows and the withdraw ceiling", () => {
  const prepare = {} as Opportunities<"onchain">["prepare"];

  it("has one method per flow", () => {
    expectTypeOf(prepare).toHaveProperty("deposit");
    expectTypeOf(prepare).toHaveProperty("withdraw");
    expectTypeOf(prepare).toHaveProperty("redeem");
    expectTypeOf(prepare).toHaveProperty("openNewStrategy");
    expectTypeOf(prepare).toHaveProperty("depositStrategy");
    expectTypeOf(prepare).toHaveProperty("withdrawStrategy");
    expectTypeOf(prepare).toHaveProperty("adjustLeverage");
    expectTypeOf(prepare).toHaveProperty("addCollateral");
    expectTypeOf(prepare).toHaveProperty("withdrawCollateral");
    expectTypeOf(prepare).toHaveProperty("repayStrategy");
    expectTypeOf(prepare).toHaveProperty("maxWithdraw");
    expectTypeOf(prepare).toHaveProperty("maxRepay");
  });

  it("takes a pool opportunity, an amount and the wallet for the LP flows", () => {
    const pool = {} as PoolOpportunityRef;
    const params = { amount: 1_000n, wallet: WALLET };
    expectTypeOf(prepare.deposit).toBeCallableWith(pool, params);
    expectTypeOf(prepare.withdraw).toBeCallableWith(pool, params);
    expectTypeOf(prepare.redeem).toBeCallableWith(pool, params);
  });

  it("answers the LP flows outright, with no promise to await", () => {
    const pool = {} as PoolOpportunityRef;
    const params = { amount: 1_000n, wallet: WALLET };
    expectTypeOf(prepare.deposit(pool, params)).toEqualTypeOf<LpSimulate>();
    expectTypeOf(prepare.withdraw(pool, params)).toEqualTypeOf<LpSimulate>();
    expectTypeOf(prepare.redeem(pool, params)).toEqualTypeOf<LpSimulate>();
  });

  it("takes a position from positions.list() for the account flows", () => {
    const position = {} as StrategyPosition;
    expectTypeOf(prepare.adjustLeverage).toBeCallableWith(position, {
      targetLeverage: 300n,
    });
  });

  it("answers in the envelope every read uses, so one chain is reported", () => {
    expectTypeOf(prepare.addCollateral).returns.resolves.toEqualTypeOf<
      DataResponse<StrategySimulate>
    >();
  });

  it("serves the flow that only pays debt down with the single-route shape", () => {
    // nothing is sold, so there is no asset whose venue could offer a second
    // route to choose from
    expectTypeOf(prepare.repayStrategy).returns.resolves.toEqualTypeOf<
      DataResponse<StrategySimulate>
    >();
    expectTypeOf(prepare.maxRepay).returns.resolves.toEqualTypeOf<
      DataResponse<bigint>
    >();
  });

  it("answers the two flows that sell an asset with both routes they can take", () => {
    // the asset sold decides which of them exist, so one call quotes both
    expectTypeOf(prepare.withdrawStrategy).returns.resolves.toEqualTypeOf<
      DataResponse<StrategyRoutesSimulate>
    >();
    expectTypeOf(prepare.adjustLeverage).returns.resolves.toEqualTypeOf<
      DataResponse<StrategyRoutesSimulate>
    >();
  });
});

describe("the delayed route is quoted with the instant one, and finished apart", () => {
  const prepare = {} as Opportunities<"onchain">["prepare"];
  const position = {} as StrategyPosition;

  it("carries the request half in the flow that can be interrupted", () => {
    // one call quotes both routes, so the delayed request is a branch of the
    // answer rather than a method of its own
    expectTypeOf<
      Extract<StrategyRoutesSimulate, { ok: true }>["delayed"]
    >().toEqualTypeOf<
      Extract<DelayedStrategySimulate, { ok: true }> | undefined
    >();
  });

  it("finishes into the shape the instant flows answer with", () => {
    expectTypeOf(prepare.finalize).toBeCallableWith(position, {
      claimable: {} as ClaimableWithdrawal,
    });
    expectTypeOf(prepare.finalize).returns.resolves.toEqualTypeOf<
      DataResponse<StrategySimulate>
    >();
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
  // they forward to `sdk.onchain.opportunities` (behind the loading policy)
  // and `sdk.offchain.opportunities`, which the mode already gates; the branch
  // of a source the mode does not read throws on access instead
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
