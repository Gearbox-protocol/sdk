import { describe, expectTypeOf, it } from "vitest";
import type {
  DataResponse,
  HistorySeries,
  Opportunity,
  PoolHistoryMetric,
  PoolOpportunity,
  PoolOpportunityRef,
  StrategyHistoryMetric,
  StrategyOpportunityRef,
  StrategyPosition,
} from "../../model/index.js";
import type { OffchainOpportunities } from "../../offchain/index.js";
import type { MultichainOpportunitiesService } from "../../sdk/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { LpSimulate, StrategySimulate } from "../simulate/index.js";
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

  it("history exists only where a backend does", () => {
    expectTypeOf<Opportunities<"offchain">>().toHaveProperty("history");
    expectTypeOf<Opportunities<"both">>().toHaveProperty("history");
    expectTypeOf<Opportunities<"onchain">>().not.toHaveProperty("history");
  });

  it("simulate exists only where a chain does", () => {
    expectTypeOf<Opportunities<"onchain">>().toHaveProperty("simulate");
    expectTypeOf<Opportunities<"both">>().toHaveProperty("simulate");
    expectTypeOf<Opportunities<"offchain">>().not.toHaveProperty("simulate");
  });

  it("a widened mode degrades to the base reads rather than to everything", () => {
    // consumers whose config object widens `mode` to `Mode` lose the gated
    // methods; they must not silently gain them
    expectTypeOf<Opportunities<Mode>>().toHaveProperty("list");
    expectTypeOf<Opportunities<Mode>>().not.toHaveProperty("history");
    // what survives widening is everything the map does not gate
    expectTypeOf<Opportunities<Mode>>().toHaveProperty("merge");
    expectTypeOf<Opportunities<Mode>>().toHaveProperty("onchain");
    expectTypeOf<Opportunities<Mode>>().toHaveProperty("offchain");
    expectTypeOf<Opportunities<Mode>>().not.toHaveProperty("simulate");
  });

  it("filtering an already-read list exists in every mode", () => {
    expectTypeOf<Opportunities<"onchain">>().toHaveProperty("filter");
    expectTypeOf<Opportunities<"offchain">>().toHaveProperty("filter");
    expectTypeOf<Opportunities<"both">>().toHaveProperty("filter");
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
    expectTypeOf(opportunities.merge.list).returns.toEqualTypeOf<
      DataResponse<Opportunity[]> | undefined
    >();
  });
});

describe("simulate covers the eight flows and the withdraw ceiling", () => {
  const simulate = {} as Opportunities<"onchain">["simulate"];

  it("has one method per flow", () => {
    expectTypeOf(simulate).toHaveProperty("deposit");
    expectTypeOf(simulate).toHaveProperty("withdraw");
    expectTypeOf(simulate).toHaveProperty("openNewStrategy");
    expectTypeOf(simulate).toHaveProperty("depositStrategy");
    expectTypeOf(simulate).toHaveProperty("withdrawStrategy");
    expectTypeOf(simulate).toHaveProperty("adjustLeverage");
    expectTypeOf(simulate).toHaveProperty("addCollateral");
    expectTypeOf(simulate).toHaveProperty("withdrawCollateral");
    expectTypeOf(simulate).toHaveProperty("maxWithdraw");
  });

  it("takes a pool opportunity and a bare amount for the LP flows", () => {
    const pool = {} as PoolOpportunity;
    expectTypeOf(simulate.deposit).toBeCallableWith(pool, 1_000n);
    expectTypeOf(simulate.withdraw).toBeCallableWith(pool, 1_000n);
  });

  it("answers the LP flows outright, with no promise to await", () => {
    const pool = {} as PoolOpportunity;
    expectTypeOf(simulate.deposit(pool, 1_000n)).toEqualTypeOf<LpSimulate>();
    expectTypeOf(simulate.withdraw(pool, 1_000n)).toEqualTypeOf<LpSimulate>();
  });

  it("takes a position from positions.list() for the account flows", () => {
    const position = {} as StrategyPosition;
    expectTypeOf(simulate.adjustLeverage).toBeCallableWith(position, {
      targetLeverage: 300n,
    });
  });

  it("reports why a request is not viable instead of throwing", () => {
    expectTypeOf<
      Awaited<ReturnType<typeof simulate.adjustLeverage>>["data"]
    >().toEqualTypeOf<StrategySimulate>();
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
