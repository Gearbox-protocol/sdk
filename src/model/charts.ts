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
export const POOL_OPPORTUNITY_CHART_METRICS = [
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
export type PoolOpportunityChartMetric =
  (typeof POOL_OPPORTUNITY_CHART_METRICS)[number];

/**
 * Every metric a strategy opportunity can chart.
 *
 * `collateralPrice` is the collateral/underlying series a liquidation-price
 * chart draws; the two USD series are the same prices quoted in dollars.
 **/
export const STRATEGY_OPPORTUNITY_CHART_METRICS = [
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
 * {@link STRATEGY_OPPORTUNITY_CHART_METRICS}.
 **/
export type StrategyOpportunityChartMetric =
  (typeof STRATEGY_OPPORTUNITY_CHART_METRICS)[number];

/**
 * Every metric a pool position can chart.
 *
 * Nothing to do with {@link POOL_OPPORTUNITY_CHART_METRICS}: an opportunity charts what the
 * pool did, a position charts what one wallet's deposit did in it. `mwr` and
 * `twr` are cumulative returns since the position opened — money-weighted, so
 * sensitive to when deposits and withdrawals landed, and time-weighted, which
 * strips that timing out. Both are anchored at inception, so a narrow `range`
 * only zooms the visible slice and its first point is rarely zero.
 **/
export const POOL_POSITION_CHART_METRICS = [
  "value",
  "apy",
  "pnl",
  "mwr",
  "twr",
  "underlyingPrice",
] as const;

/**
 * Metric a pool position can chart, derived from
 * {@link POOL_POSITION_CHART_METRICS}.
 **/
export type PoolPositionChartMetric =
  (typeof POOL_POSITION_CHART_METRICS)[number];

/**
 * Every metric a strategy position can chart.
 *
 * `twrApy` annualizes `twr` over the position's whole life; the two trailing
 * APYs annualize it over a fixed window instead, so they track the current pace
 * rather than the lifetime rate and are comparable across positions of
 * different ages.
 **/
export const STRATEGY_POSITION_CHART_METRICS = [
  "totalValueUsd",
  "totalValueUnderlying",
  "debt",
  "healthFactor",
  "leverage",
  "borrowApy",
  "underlyingPrice",
  "pnl",
  "mwr",
  "twr",
  "twrApy",
  "trailingApy7d",
  "trailingApy30d",
] as const;

/**
 * Metric a strategy position can chart, derived from
 * {@link STRATEGY_POSITION_CHART_METRICS}.
 *
 * The backend also serves a `collateralPrice` series for a strategy position,
 * which this model cannot name yet: a position holds several collaterals, so
 * that read answers with one series per token, while a {@link ChartBundle}
 * carries one series per metric. Charting it needs either a key that names the
 * token or a token argument on the read.
 **/
export type StrategyPositionChartMetric =
  (typeof STRATEGY_POSITION_CHART_METRICS)[number];

/**
 * Any metric an opportunity can chart.
 **/
export type OpportunityChartMetric =
  | PoolOpportunityChartMetric
  | StrategyOpportunityChartMetric;

/**
 * Any metric a position can chart.
 **/
export type PositionChartMetric =
  | PoolPositionChartMetric
  | StrategyPositionChartMetric;

/**
 * Any metric the read model can chart.
 *
 * The two sides overlap only where they mean the same thing — `borrowApy` is
 * the same rate whether an opportunity or a position charts it — so one metric
 * has one unit in {@link CHART_METRIC_UNITS} no matter who asks for it.
 **/
export type ChartMetric = OpportunityChartMetric | PositionChartMetric;

/**
 * What one chart read asks for, beyond the subject its route names.
 *
 * The request side of a chart, mirroring how a list read carries its
 * `OpportunityFilter`: the SDK encodes it into the query string and the backend
 * decodes the same codec, so neither side has to restate how a metric list
 * travels in a URL.
 **/
export interface ChartQuery {
  /**
   * Metrics to chart, at least one and each named once. They become the keys of
   * {@link ChartBundle.series}.
   **/
  metrics: readonly ChartMetric[];
  /**
   * Window to cover, echoed back in {@link ChartWindow.range}.
   **/
  range: ChartRange;
}

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
  | "ratio"
  /**
   * A plain number on no scale at all, plotted as it arrives: `5.5` is 5.5,
   * which a leverage chart renders as `5.5x`.
   *
   * Only leverage is one. The model carries it as `Leverage`, explicitly
   * neither a percentage nor basis points. Health factor is not — it is `bps`,
   * `10000` being the liquidation boundary, which is how the position row
   * quotes it, and naming this unit after a "factor" or a "multiplier" would
   * read as though it were.
   **/
  | "scalar";

/**
 * Unit of every metric, the one place either side decides it.
 *
 * A metric added to a union above fails to compile here until its unit is
 * named, and the wire schema rejects a series whose `unit` disagrees with this
 * table, so the backend cannot drift from it silently.
 **/
export const CHART_METRIC_UNITS = {
  // opportunities
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
  // positions. A return is a rate like any other, so `mwr`, `twr`, `twrApy` and
  // the trailing pair are `bps` — the backend's own fractions (0.05) scaled the
  // way every rate in this model is (500)
  value: "token",
  apy: "bps",
  pnl: "token",
  mwr: "bps",
  twr: "bps",
  underlyingPrice: "usd",
  totalValueUsd: "usd",
  totalValueUnderlying: "token",
  debt: "token",
  healthFactor: "bps",
  leverage: "scalar",
  twrApy: "bps",
  trailingApy7d: "bps",
  trailingApy30d: "bps",
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
  | { unit: "scalar" }
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
