import type { OpportunityKey } from "./opportunities.js";
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
 * Any series the read model can return.
 **/
export type HistoryMetric = PoolHistoryMetric | StrategyHistoryMetric;

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
