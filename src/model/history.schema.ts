import { z } from "zod/v4";
import { opportunityKeySchema } from "./opportunities.schema.js";
import { timestampSchema } from "./primitives.schema.js";

/**
 * Runtime schemas for {@link ./history.js}, see the note in
 * `primitives.schema.ts` on why they are written by hand.
 **/

/**
 * {@link HistoryRange}
 **/
export const historyRangeSchema = z.union([
  z.literal("1d"),
  z.literal("1w"),
  z.literal("1m"),
  z.literal("1y"),
  z.literal("max"),
]);

/**
 * {@link PoolHistoryMetric}
 **/
export const poolHistoryMetricSchema = z.union([
  z.literal("depositApy"),
  z.literal("borrowApy"),
  z.literal("dieselRate"),
  z.literal("supplied"),
  z.literal("borrowed"),
  z.literal("availableLiquidity"),
]);

/**
 * {@link StrategyHistoryMetric}
 **/
export const strategyHistoryMetricSchema = z.union([
  z.literal("netApy"),
  z.literal("borrowApy"),
  z.literal("collateralApy"),
  z.literal("tvl"),
  z.literal("collateralPrice"),
  z.literal("collateralUsdPrice"),
  z.literal("underlyingUsdPrice"),
]);

/**
 * {@link HistoryMetric}
 **/
export const historyMetricSchema = z.union([
  poolHistoryMetricSchema,
  strategyHistoryMetricSchema,
]);

/**
 * {@link HistoryPoint}
 **/
export const historyPointSchema = z.object({
  timestamp: timestampSchema,
  value: z.number(),
});

/**
 * {@link HistorySeries}
 **/
export const historySeriesSchema = z.object({
  metric: historyMetricSchema,
  points: z.array(historyPointSchema),
});

/**
 * {@link OpportunityHistoryQuery}
 **/
export const opportunityHistoryQuerySchema = z.object({
  opportunity: opportunityKeySchema,
  range: historyRangeSchema,
  metric: historyMetricSchema,
});
