import type { OpportunityKey } from "./opportunities.js";
import type { PositionKey } from "./positions.js";
import type { Timestamp } from "./primitives.js";

/**
 * Historical time series of an opportunity.
 *
 * History is backend-only by construction: the chain serves the present, and
 * reconstructing a series from it would mean archive-node reads per point.
 **/

/**
 * Time window a series covers, ending at the present.
 *
 * `"max"` is the full history the backend retains for the opportunity.
 **/
export type HistoryRange = "1d" | "1w" | "1m" | "1y" | "max";

/**
 * Series available for a pool opportunity.
 **/
export type PoolHistoryMetric =
  | "depositApy"
  | "borrowApy"
  | "dieselRate"
  | "supplied"
  | "borrowed"
  | "availableLiquidity";

/**
 * Every {@link PoolHistoryMetric}, for callers that enumerate them.
 **/
export const POOL_HISTORY_METRICS = [
  "depositApy",
  "borrowApy",
  "dieselRate",
  "supplied",
  "borrowed",
  "availableLiquidity",
] as const satisfies readonly PoolHistoryMetric[];

/**
 * Series available for a strategy opportunity.
 *
 * `collateralPrice` is the collateral/underlying series a liquidation-price
 * chart draws; the two USD series are the same prices quoted in dollars.
 **/
export type StrategyHistoryMetric =
  | "netApy"
  | "borrowApy"
  | "collateralApy"
  | "tvl"
  | "collateralPrice"
  | "collateralUsdPrice"
  | "underlyingUsdPrice";

/**
 * Every {@link StrategyHistoryMetric}, for callers that enumerate them.
 **/
export const STRATEGY_HISTORY_METRICS = [
  "netApy",
  "borrowApy",
  "collateralApy",
  "tvl",
  "collateralPrice",
  "collateralUsdPrice",
  "underlyingUsdPrice",
] as const satisfies readonly StrategyHistoryMetric[];

/**
 * Series available for a pool position.
 *
 * Spelled out rather than aliased to {@link PoolHistoryMetric}: an opportunity
 * and a position are separate contracts with the backend, and the position
 * series are expected to grow their own members (PnL above all) without that
 * change reaching the opportunity charts.
 **/
export type PoolPositionHistoryMetric =
  | "depositApy"
  | "borrowApy"
  | "dieselRate"
  | "supplied"
  | "borrowed"
  | "availableLiquidity";

/**
 * Every {@link PoolPositionHistoryMetric}, for callers that enumerate them.
 **/
export const POOL_POSITION_HISTORY_METRICS = [
  "depositApy",
  "borrowApy",
  "dieselRate",
  "supplied",
  "borrowed",
  "availableLiquidity",
] as const satisfies readonly PoolPositionHistoryMetric[];

/**
 * Series available for a strategy position, see the note on
 * {@link PoolPositionHistoryMetric} for why these are spelled out separately
 * from {@link StrategyHistoryMetric}.
 **/
export type StrategyPositionHistoryMetric =
  | "netApy"
  | "borrowApy"
  | "collateralApy"
  | "tvl"
  | "collateralPrice"
  | "collateralUsdPrice"
  | "underlyingUsdPrice";

/**
 * Every {@link StrategyPositionHistoryMetric}, for callers that enumerate them.
 **/
export const STRATEGY_POSITION_HISTORY_METRICS = [
  "netApy",
  "borrowApy",
  "collateralApy",
  "tvl",
  "collateralPrice",
  "collateralUsdPrice",
  "underlyingUsdPrice",
] as const satisfies readonly StrategyPositionHistoryMetric[];

/**
 * Any series a position can return.
 **/
export type PositionHistoryMetric =
  | PoolPositionHistoryMetric
  | StrategyPositionHistoryMetric;

/**
 * Any series the read model can return.
 **/
export type HistoryMetric =
  | PoolHistoryMetric
  | StrategyHistoryMetric
  | PositionHistoryMetric;

/**
 * One sample of a series.
 **/
export interface HistoryPoint {
  /**
   * When the sample was taken.
   **/
  timestamp: Timestamp;
  /**
   * Sampled value. The unit follows from the metric: APY metrics are in basis
   * points, amount metrics are in the underlying's base units expressed as a
   * float, price metrics are plain prices.
   *
   * @example `842` for an 8.42% APY sample
   **/
  value: number;
}

/**
 * Annotations the backend ships alongside a series, e.g. what a chart drawn
 * from it should say beyond the points themselves.
 *
 * TODO: the backend has not specified this payload yet. It stays empty until
 * it does, so that filling it in later is additive rather than a rename.
 **/
// biome-ignore lint/suspicious/noEmptyInterface: placeholder, see doc comment
export interface HistoryChartMetadata {}

/**
 * A named series of samples ordered by ascending timestamp.
 *
 * @typeParam M - Metric the series carries.
 **/
export interface HistorySeries<M extends string = HistoryMetric> {
  /**
   * Metric the samples belong to; it also defines their unit, so no separate
   * unit field ships.
   **/
  metric: M;
  /**
   * Samples, oldest first.
   **/
  points: HistoryPoint[];
  /**
   * What the backend says about the series, see {@link HistoryChartMetadata}.
   **/
  metadata: HistoryChartMetadata;
}

/**
 * A request for one series of a single opportunity.
 *
 * @typeParam M - Metric requested.
 **/
export interface OpportunityHistoryQuery<
  M extends HistoryMetric = HistoryMetric,
> {
  /**
   * Opportunity the series belongs to.
   **/
  opportunity: OpportunityKey;
  /**
   * Window to cover.
   **/
  range: HistoryRange;
  /**
   * Metric to return. A metric that does not apply to the opportunity's kind
   * has no series.
   **/
  metric: M;
}

/**
 * A request for one series of a single position.
 *
 * @typeParam M - Metric requested.
 **/
export interface PositionHistoryQuery<
  M extends PositionHistoryMetric = PositionHistoryMetric,
> {
  /**
   * Position the series belongs to.
   **/
  position: PositionKey;
  /**
   * Window to cover.
   **/
  range: HistoryRange;
  /**
   * Metric to return. A metric that does not apply to the position's kind has
   * no series.
   **/
  metric: M;
}
