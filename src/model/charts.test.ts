import { describe, expect, it } from "vitest";
import { z } from "zod/v4";
import { chartBundleSchemaFor, chartQueryCodec } from "./charts.schema.js";

/**
 * The wire invariants a chart read enforces. They are what a consumer is
 * allowed to assume — that two series of a bundle line up index for index, and
 * that a unit means what the metric says it means — so each one is checked
 * against a payload that breaks it alone.
 **/

const USDC = {
  chainId: 1,
  address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  symbol: "USDC",
  name: "USD Coin",
  decimals: 6,
};

const TIMESTAMPS = [1_719_792_000, 1_719_795_600, 1_719_799_200];

const WINDOW = { range: "1d", from: TIMESTAMPS[0], to: TIMESTAMPS.at(-1) };

const GRID = { kind: "grid", intervalSeconds: 3_600 };

const APY = { status: "ok", unit: "bps", values: [512, 530, 528] };
const SUPPLIED = {
  status: "ok",
  unit: "token",
  base: USDC,
  values: [1_000.5, null, 1_200],
};

/** A bundle that upholds every invariant, for a test to break one at a time. **/
function bundle(overrides: Record<string, unknown> = {}): unknown {
  return {
    window: WINDOW,
    timestamps: TIMESTAMPS,
    sampling: GRID,
    series: { depositApy: APY, supplied: SUPPLIED },
    ...overrides,
  };
}

const schema = chartBundleSchemaFor(["depositApy", "supplied"], "1d");
/** The same read narrowed to one metric, for a case about that series alone. **/
const apyOnly = chartBundleSchemaFor(["depositApy"], "1d");

describe("a chart read validates what a chart is allowed to assume", () => {
  it("accepts a bundle whose series share the axis", () => {
    const parsed = schema.parse(bundle());

    expect(parsed.timestamps).toEqual(TIMESTAMPS);
    expect(parsed.sampling).toEqual(GRID);
    expect(Object.keys(parsed.series)).toEqual(["depositApy", "supplied"]);
  });

  it("keeps a gap a gap", () => {
    // the one value a chart must not invent: a bucket with no observation is a
    // break in the line, and zero is a price
    const { series } = schema.parse(bundle());

    expect(series.supplied.status).toBe("ok");
    expect(series.supplied.status === "ok" && series.supplied.values).toEqual([
      1_000.5,
      null,
      1_200,
    ]);
  });

  it("rejects a series that does not span the axis", () => {
    const short = bundle({
      series: { depositApy: { ...APY, values: [512, 530] } },
    });

    expect(() => apyOnly.parse(short)).toThrow(/2 values for 3 timestamps/);
  });

  it("rejects a unit the metric does not have", () => {
    const wrong = bundle({
      series: { depositApy: { ...SUPPLIED, values: [512, 530, 528] } },
    });

    expect(() => apyOnly.parse(wrong)).toThrow(
      /depositApy.. is bps, not token/,
    );
  });

  it("rejects a window that disagrees with the axis it describes", () => {
    const skewed = bundle({ window: { ...WINDOW, to: 1_719_802_800 } });

    expect(() => schema.parse(skewed)).toThrow(/window ends at/);
  });

  it("rejects a window other than the one requested", () => {
    const wrongRange = bundle({ window: { ...WINDOW, range: "1y" } });

    expect(() => schema.parse(wrongRange)).toThrow(
      /requested range 1d, received 1y/,
    );
  });

  it("rejects a metric that was not asked for", () => {
    expect(() => apyOnly.parse(bundle())).toThrow();
  });

  it("rejects a bundle short one of the metrics it was asked for", () => {
    // a bundle missing a series would draw as a chart with a line silently
    // absent, which reads as "this metric was flat" rather than "not answered".
    // Answered twice is not a case: an object cannot hold a key twice
    const short = bundle({ series: { depositApy: APY } });

    expect(() => schema.parse(short)).toThrow();
  });

  it("carries a series the backend could not produce instead of an empty one", () => {
    // unavailable is not "no data": one is a chart that cannot be drawn, the
    // other is a flat line. It still counts as the metric being answered
    const { series } = schema.parse(
      bundle({
        series: {
          depositApy: {
            status: "unavailable",
            reason: { code: "not_indexed", message: "pool added yesterday" },
          },
          supplied: SUPPLIED,
        },
      }),
    );

    expect(series.depositApy).toMatchObject({
      status: "unavailable",
      reason: { code: "not_indexed" },
    });
  });

  it("refuses to build a schema for no metrics at all", () => {
    expect(() => chartBundleSchemaFor([] as never, "1d")).toThrow(RangeError);
  });

  it("refuses duplicate metrics", () => {
    expect(() =>
      chartBundleSchemaFor(["depositApy", "depositApy"], "1d"),
    ).toThrow(/distinct metrics/);
  });
});

describe("a position charts its own metrics", () => {
  const positionBundle = (series: Record<string, unknown>): unknown =>
    bundle({ series });

  it("accepts the units a strategy position carries", () => {
    // leverage is the one value on no scale at all; health factor is not — it
    // is bps, the same scale the position row quotes it in
    const schema = chartBundleSchemaFor(
      ["leverage", "healthFactor", "totalValueUsd", "debt"],
      "1d",
    );
    const { series } = schema.parse(
      positionBundle({
        leverage: { status: "ok", unit: "scalar", values: [2.5, 2.6, 2.4] },
        healthFactor: {
          status: "ok",
          unit: "bps",
          values: [12_500, 12_000, 0],
        },
        totalValueUsd: {
          status: "ok",
          unit: "usd",
          values: [1_000, 1_100, 900],
        },
        debt: { ...SUPPLIED },
      }),
    );

    expect(series.leverage.status === "ok" && series.leverage.unit).toBe(
      "scalar",
    );
    expect(
      series.healthFactor.status === "ok" && series.healthFactor.unit,
    ).toBe("bps");
  });

  it("rejects an opportunity metric on a position read", () => {
    // the two sides do not share a metric list: `depositApy` is what the pool
    // paid, `apy` is what this deposit earned
    const schema = chartBundleSchemaFor(["apy"], "1d");

    expect(() => schema.parse(positionBundle({ depositApy: APY }))).toThrow();
  });

  it("holds a return to the scale every rate in the model uses", () => {
    // the backend sends 0.05 for +5%; a chart must carry 500, like every other
    // rate here, or it plots 100x off against the row it decorates
    const schema = chartBundleSchemaFor(["twr"], "1d");

    expect(() =>
      schema.parse(
        positionBundle({
          twr: {
            status: "ok",
            unit: "ratio",
            base: USDC,
            quote: USDC,
            values: [1, 2, 3],
          },
        }),
      ),
    ).toThrow(/twr.. is bps, not ratio/);
  });
});

describe("every read is sampled onto a grid", () => {
  it("answers a one-metric read the same way as a several-metric one", () => {
    // there is one sampling, so `metric` and `metrics` differ in their route
    // and in nothing else — the grid is what lets either line up with a read of
    // another subject
    const parsed = apyOnly.parse(bundle({ series: { depositApy: APY } }));

    expect(parsed.sampling).toEqual(GRID);
  });

  it("rejects a sampling the model does not have", () => {
    const m4 = bundle({ sampling: { kind: "m4", bucketSeconds: 3_600 } });

    expect(() => schema.parse(m4)).toThrow();
  });

  it("rejects timestamps that do not follow the declared grid", () => {
    const irregular = bundle({
      timestamps: [TIMESTAMPS[0], TIMESTAMPS[1], TIMESTAMPS[2] + 1],
      window: { ...WINDOW, to: TIMESTAMPS[2] + 1 },
    });

    expect(() => schema.parse(irregular)).toThrow(/grid|seconds apart/);
  });
});

describe("a chart request travels as one codec both sides share", () => {
  const query = { metrics: ["debt", "leverage"], range: "1m" } as const;

  it("joins the metrics into one parameter", () => {
    // repeated `?metrics=` entries would order differently between clients and
    // give one request two cache keys
    expect(z.encode(chartQueryCodec, query)).toEqual({
      metrics: "debt,leverage",
      range: "1m",
    });
  });

  it("decodes what it encodes", () => {
    expect(z.decode(chartQueryCodec, z.encode(chartQueryCodec, query))).toEqual(
      query,
    );
  });

  it("refuses a read that names no metric", () => {
    // caught before the request is issued rather than after a round trip
    expect(() =>
      z.encode(chartQueryCodec, { metrics: [], range: "1m" }),
    ).toThrow(/at least one metric/);
  });

  it("refuses a metric named twice, from either direction", () => {
    expect(() =>
      z.encode(chartQueryCodec, { metrics: ["debt", "debt"], range: "1m" }),
    ).toThrow(/distinct metrics/);
    expect(() =>
      z.decode(chartQueryCodec, { metrics: "debt,debt", range: "1m" }),
    ).toThrow(/distinct metrics/);
  });

  it("refuses a metric the model does not have", () => {
    // the backend decodes with this same codec, so an unknown metric is a 400
    // there rather than an empty series
    expect(() =>
      z.decode(chartQueryCodec, { metrics: "debt,nope", range: "1m" }),
    ).toThrow();
  });

  it("refuses a malformed metric list", () => {
    expect(() =>
      z.decode(chartQueryCodec, { metrics: "debt,", range: "1m" }),
    ).toThrow();
  });
});
