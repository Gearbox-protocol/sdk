import { describe, expectTypeOf, it } from "vitest";
import type {
  ChartBundle,
  ChartSeries,
  DataResponse,
  PoolPositionChartMetric,
  PoolPositionRef,
  Position,
  StrategyPositionRef,
} from "../../model/index.js";
import type { IOffchainPositions } from "../../offchain/index.js";
import type { Mode } from "../types.js";
import type { IPositions } from "./types.js";

describe("mode gates method existence", () => {
  it("a widened mode degrades to the base reads rather than to everything", () => {
    // consumers whose config object widens `mode` to `Mode` lose the gated
    // methods; they must not silently gain them
    expectTypeOf<IPositions<Mode>>().toHaveProperty("list");
    expectTypeOf<IPositions<Mode>>().not.toHaveProperty("charts");
    // what survives widening is everything the map does not gate
    expectTypeOf<IPositions<Mode>>().toHaveProperty("merge");
    expectTypeOf<IPositions<Mode>>().not.toHaveProperty("onchain");
    expectTypeOf<IPositions<Mode>>().not.toHaveProperty("offchain");
  });
});

describe("reads narrow by what they were given", () => {
  it("narrows a list already read to a list, and a pending read to pending", () => {
    const positions = {} as IPositions<"both">;
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

  it("answers a list merge definitely once either side has arrived", () => {
    const positions = {} as IPositions<"both">;
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
  const positions = {} as IPositions<"both">;
  const backend = {} as IOffchainPositions;
  const pool = {} as PoolPositionRef;
  const strategy = {} as StrategyPositionRef;

  it("takes the metrics of the kind the key names", () => {
    expectTypeOf(
      positions.charts(pool, ["apy", "mwr"], "1m"),
    ).resolves.toExtend<DataResponse<ChartBundle<readonly ["apy", "mwr"]>>>();
    expectTypeOf(
      positions.charts(
        strategy,
        ["totalValueUnderlying", "borrowApyAvg7d"],
        "1y",
      ),
    ).resolves.toExtend<
      DataResponse<
        ChartBundle<readonly ["totalValueUnderlying", "borrowApyAvg7d"]>
      >
    >();
  });

  it("rejects a metric the other kind owns", () => {
    // @ts-expect-error `healthFactor` belongs to a strategy position
    positions.charts(pool, ["healthFactor"], "1y");
    // @ts-expect-error `netApy7d` belongs to a strategy position
    positions.charts(pool, ["netApy7d"], "1m");
    // @ts-expect-error `apy` belongs to a pool position
    positions.charts(strategy, ["totalValueUnderlying", "apy"], "1m");
    // The source escape hatch preserves the same constraint.
    // @ts-expect-error `healthFactor` belongs to a strategy position
    backend.getCharts(pool, ["healthFactor"], "1y");
  });

  it("rejects a metric only an opportunity charts", () => {
    // a position's metrics are its own: what the pool did is not what this
    // wallet's deposit did in it
    // @ts-expect-error `depositApy` is an opportunity metric
    positions.charts(pool, ["depositApy"], "1m");
    // @ts-expect-error `tvl` is an opportunity metric
    positions.charts(strategy, ["tvl"], "1m");
  });

  it("keys the bundle by the metrics that were asked for, and no others", async () => {
    const { data } = await positions.charts(
      strategy,
      ["totalValueUnderlying", "borrowApyAvg7d"],
      "1m",
    );

    expectTypeOf(data.series.totalValueUnderlying).toEqualTypeOf<ChartSeries>();
    expectTypeOf(data.series.borrowApyAvg7d).toEqualTypeOf<ChartSeries>();
    // @ts-expect-error only `totalValueUnderlying` and `borrowApyAvg7d` were requested
    data.series.debt;
  });

  it("makes keys optional when the metric list is dynamic", async () => {
    const metrics: PoolPositionChartMetric[] = ["apy"];
    const { data } = await positions.charts(pool, metrics, "1m");

    expectTypeOf(data.series.apy).toEqualTypeOf<ChartSeries | undefined>();
  });
});
