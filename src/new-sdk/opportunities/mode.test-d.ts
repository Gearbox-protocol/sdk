import type { Address } from "viem";
import { describe, expectTypeOf, it } from "vitest";
import type {
  PoolHistoryMetric,
  PoolOpportunity,
  PoolOpportunityRef,
  StrategyHistoryMetric,
  StrategyOpportunityRef,
  StrategyPosition,
} from "../../model/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { LpSimulate, StrategySimulate } from "../simulate/index.js";
import type { Mode } from "../types.js";
import type { Chart } from "../utils/index.js";
import type { Opportunities } from "./types.js";

/**
 * Mode gates which methods exist, not what they return, so a call the mode
 * cannot serve has to fail at compile time. These assertions are the only thing
 * that proves it: nothing at runtime distinguishes the three shapes, because
 * one class implements all of them.
 **/

const WALLET = "0xf0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0f0" as Address;

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
    expectTypeOf<Opportunities<Mode>>().not.toHaveProperty("simulate");
  });
});

describe("simulate covers the eight flows", () => {
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
  });

  it("takes a pool opportunity, an amount and the wallet for the LP flows", () => {
    const pool = {} as PoolOpportunity;
    const params = { amount: 1_000n, wallet: WALLET };
    expectTypeOf(simulate.deposit).toBeCallableWith(pool, params);
    expectTypeOf(simulate.withdraw).toBeCallableWith(pool, params);
  });

  it("answers the LP flows outright, with no promise to await", () => {
    const pool = {} as PoolOpportunity;
    const params = { amount: 1_000n, wallet: WALLET };
    expectTypeOf(simulate.deposit(pool, params)).toEqualTypeOf<LpSimulate>();
    expectTypeOf(simulate.withdraw(pool, params)).toEqualTypeOf<LpSimulate>();
  });

  it("takes a position from positions.list() for the account flows", () => {
    const position = {} as StrategyPosition;
    expectTypeOf(simulate.adjustLeverage).toBeCallableWith(position, {
      targetLeverage: 300n,
    });
  });

  it("reports why a request is not viable instead of throwing", () => {
    expectTypeOf<
      Awaited<ReturnType<typeof simulate.adjustLeverage>>["result"]
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

  it("answers with the points to draw and what annotates them", () => {
    expectTypeOf(
      opportunities.history(strategy).chart,
    ).returns.resolves.toEqualTypeOf<Chart>();
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
