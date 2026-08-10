import { describe, expectTypeOf, it } from "vitest";
import type {
  HistoryRange,
  HistorySeries,
  PoolOpportunityRef,
  StrategyOpportunityRef,
} from "../../model/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { Mode, ReadResult } from "../types.js";
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
  });
});

describe("the opportunity kind gates which series it has", () => {
  const opportunities = {} as Opportunities<"both">;
  const pool = {} as PoolOpportunityRef;
  const strategy = {} as StrategyOpportunityRef;

  it("serves the metrics of the kind the key names", () => {
    expectTypeOf(opportunities.history(pool)).toHaveProperty("depositApy");
    expectTypeOf(opportunities.history(strategy)).toHaveProperty("netApy");
  });

  it("has no method for a metric the other kind owns", () => {
    expectTypeOf(opportunities.history(pool)).not.toHaveProperty(
      "underlyingUsdPrice",
    );
    expectTypeOf(opportunities.history(strategy)).not.toHaveProperty(
      "dieselRate",
    );
  });

  it("types a series with the metric its method named", () => {
    // the point of the method bag: the result is not the whole metric union
    expectTypeOf(
      opportunities.history(strategy).underlyingUsdPrice,
    ).toEqualTypeOf<
      (
        range: HistoryRange,
      ) => Promise<ReadResult<HistorySeries<"underlyingUsdPrice">>>
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
