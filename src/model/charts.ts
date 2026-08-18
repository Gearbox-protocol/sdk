import type { Timestamp, Token } from "./primitives.js";

/**
 * Historical charts of an opportunity or a position.
 *
 * Charts are backend-only by construction: the chain serves the present, and
 * reconstructing a series from it would mean archive-node reads per point.
 *
 * A chart is read as a {@link ChartBundle}: one shared x-axis plus one
 * {@link ChartSeries} per metric, each holding values only. Alignment is
 * therefore structural — series `i` and series `j` describe the same instant at
 * the same index — rather than a property the backend promises and every
 * consumer re-checks.
 **/

/**
 * Time window a chart covers, ending at the present.
 *
 * `"max"` is the full history the backend retains for the subject.
 **/
export const CHART_RANGES = ["1d", "1w", "1m", "1y", "max"] as const;

export type ChartRange = (typeof CHART_RANGES)[number];

/**
 * Every metric a pool opportunity can chart.
 **/
export const POOL_CHART_METRICS = [
  "depositApy",
  "borrowApy",
  "dieselRate",
  "supplied",
  "borrowed",
  "availableLiquidity",
] as const;

/**
 * Metric a pool opportunity can chart. Derived from the runtime list that also
 * builds the backend's route enum, so the two cannot drift.
 **/
export type PoolChartMetric = (typeof POOL_CHART_METRICS)[number];

/**
 * Every metric a strategy opportunity can chart.
 *
 * `collateralPrice` is the collateral/underlying series a liquidation-price
 * chart draws; the two USD series are the same prices quoted in dollars.
 **/
export const STRATEGY_CHART_METRICS = [
  "netApy",
  "borrowApy",
  "collateralApy",
  "tvl",
  "collateralPrice",
  "collateralUsdPrice",
  "underlyingUsdPrice",
] as const;

/**
 * Metric a strategy opportunity can chart, derived from
 * {@link STRATEGY_CHART_METRICS}.
 **/
export type StrategyChartMetric = (typeof STRATEGY_CHART_METRICS)[number];

/**
 * Metrics a pool position can chart.
 *
 * This currently matches {@link PoolChartMetric}. Give it its own union when
 * the position endpoint gains position-only metrics.
 **/
export type PoolPositionChartMetric = PoolChartMetric;

/**
 * Metrics a strategy position can chart. This currently matches
 * {@link StrategyChartMetric}; it can diverge when the endpoint does.
 **/
export type StrategyPositionChartMetric = StrategyChartMetric;

/**
 * Any metric a position can chart.
 **/
export type PositionChartMetric =
  | PoolPositionChartMetric
  | StrategyPositionChartMetric;

/**
 * Any metric the read model can chart.
 **/
export type ChartMetric = PoolChartMetric | StrategyChartMetric;

/**
 * Scale a chart's values are on.
 *
 * There is no `percent`: every percentage-like value of the read model is
 * `Bps`, and a chart that quoted `5.2` where its own row quotes `520` would be
 * plotted 100x off. Health factor is `bps` for the same reason — the model
 * already carries it that way, `10000` being the liquidation boundary.
 **/
export type ChartUnit =
  /**
   * Integer basis points, `10000` = 100%.
   **/
  | "bps"
  /**
   * US dollars, a plain float.
   **/
  | "usd"
  /**
   * Whole tokens of the denomination's `base`, a plain float.
   *
   * Deliberately not an `Amount`: base units as `bigint` carry precision a
   * chart cannot draw. A chart value is therefore *not* interchangeable with an
   * `Amount.value`.
   **/
  | "token"
  /**
   * How many of the denomination's `quote` one whole `base` is worth, a plain
   * float.
   **/
  | "ratio";

/**
 * Unit of every metric, the one place either side decides it.
 *
 * A metric added to a union above fails to compile here until its unit is
 * named, and the wire schema rejects a series whose `unit` disagrees with this
 * table, so the backend cannot drift from it silently.
 **/
export const CHART_METRIC_UNITS = {
  depositApy: "bps",
  borrowApy: "bps",
  netApy: "bps",
  collateralApy: "bps",
  supplied: "token",
  borrowed: "token",
  availableLiquidity: "token",
  tvl: "token",
  dieselRate: "ratio",
  collateralPrice: "ratio",
  collateralUsdPrice: "usd",
  underlyingUsdPrice: "usd",
} as const satisfies Record<ChartMetric, ChartUnit>;

/**
 * A unit together with what it is denominated in.
 *
 * Modelled as a union rather than an optional `denomination` field so that a
 * `token` series without its token, or a `bps` series carrying one, does not
 * typecheck. It is not narrowed by the metric: resolving it through `M` would
 * make {@link ChartBundle} invariant in `M`, and a bundle of two metrics would
 * stop being assignable to a `ChartBundle` parameter. That the two agree is
 * enforced on every read instead, against {@link CHART_METRIC_UNITS}.
 **/
export type ChartDenomination =
  | { unit: "bps" }
  | { unit: "usd" }
  | {
      unit: "token";
      /**
       * Token the values count whole units of.
       **/
      base: Token;
    }
  | {
      unit: "ratio";
      /**
       * Token one unit of which the value prices.
       *
       * @example wstETH, for a `collateralPrice` of wstETH in USDC
       **/
      base: Token;
      /**
       * Token the value is expressed in: `value` of these per one `base`.
       *
       * @example USDC, for a `collateralPrice` of wstETH in USDC
       **/
      quote: Token;
    };

/**
 * One sampled value, or `null` where the series has no observation.
 *
 * `null` is a gap and breaks the line — it is never a zero. A rate that simply
 * did not change is carried forward instead, see {@link GridSampling}.
 **/
export type ChartValue = number | null;

/**
 * Reason a series could not be produced at all, which is not the same as a
 * series that has no points in the window.
 **/
export const CHART_UNAVAILABLE_CODES = [
  "unknown_subject",
  "unsupported_metric",
  "no_price_feed",
  "not_indexed",
  "internal",
] as const;

export type ChartUnavailableCode = (typeof CHART_UNAVAILABLE_CODES)[number];

/**
 * A series that was produced, holding one value per timestamp of its bundle.
 *
 * It does not name its own metric: it is reached through the key that does, see
 * {@link ChartBundle}.
 **/
export type ChartSeriesOk = {
  status: "ok";
  /**
   * Values aligned to the bundle's `timestamps`, index for index and of the
   * same length, so two series of one bundle are directly comparable.
   **/
  values: ChartValue[];
} & ChartDenomination;

/**
 * A series that could not be produced.
 **/
export interface ChartSeriesUnavailable {
  status: "unavailable";
  reason: {
    /**
     * Machine-readable cause, safe to `switch` on.
     **/
    code: ChartUnavailableCode;
    /**
     * English detail for logs. Not a translation key: what a screen shows is
     * decided from {@link ChartUnavailableCode}, in the consumer's own
     * catalogue.
     **/
    message?: string;
  };
}

/**
 * One metric of one bundle, discriminated on `status`: an unavailable series
 * has no values, and an available one has no reason.
 **/
export type ChartSeries = ChartSeriesOk | ChartSeriesUnavailable;

/**
 * Window a bundle covers, resolved by the backend.
 *
 * Present even when every series is empty, so a chart still has an axis to draw
 * and a range selector still has something to highlight.
 **/
export interface ChartWindow {
  /**
   * Window that was asked for.
   **/
  range: ChartRange;
  /**
   * Inclusive start, equal to the first timestamp of the bundle.
   **/
  from: Timestamp;
  /**
   * Inclusive end, equal to the last timestamp of the bundle.
   **/
  to: Timestamp;
}

/**
 * Evenly spaced samples, which is what lets two series share an axis.
 *
 * A bucket in which a metric did not change carries the last known value; a
 * bucket outside the series' lifetime — before its first observation or after
 * its last — is `null`. Extrema inside a bucket are lost, which is the price of
 * alignment.
 **/
export interface GridSampling {
  /**
   * The one sampling there is. Kept as a discriminant so a second one can be
   * added later without breaking a consumer that already switches on it.
   **/
  kind: "grid";
  /**
   * Distance between consecutive timestamps, in seconds. Boundaries fall on
   * multiples of it, so concurrent readers get the same grid — and so two reads
   * of different subjects line up and can be drawn against each other.
   **/
  intervalSeconds: number;
}

/**
 * What a chart read answers with: one subject, one shared x-axis, and the
 * series that were asked for.
 *
 * `Metrics` has no default. A bundle is always parameterized by the metric list
 * one read received. A literal list gives exact required keys; a dynamically
 * sized array gives optional keys because its runtime members are not known to
 * TypeScript.
 *
 * @typeParam Metrics - Metric list the read received.
 **/
// no `subject` field: a bundle is read through a subject-scoped reader, so the
// caller already holds the key it passed in. Echoing it would also be
// unverifiable — a pool position key and a pool opportunity key are the same
// shape but for `wallet`, so a wire union of the two cannot tell them apart
export interface ChartBundle<Metrics extends readonly ChartMetric[]> {
  window: ChartWindow;
  sampling: GridSampling;
  /**
   * The shared x-axis, ascending. Every available series holds exactly this
   * many values.
   **/
  timestamps: Timestamp[];
  /**
   * One series per requested metric, keyed by it: `series.depositApy`.
   *
   * A literal metric tuple makes each requested key required. For a dynamic
   * array the keys are optional: runtime validation still guarantees that every
   * requested metric is present, but the compiler cannot know which metrics the
   * array contains.
   **/
  series: ChartSeriesMap<Metrics>;
}

type ChartSeriesMap<Metrics extends readonly ChartMetric[]> =
  number extends Metrics["length"]
    ? Partial<Record<Metrics[number], ChartSeries>>
    : Record<Metrics[number], ChartSeries>;
