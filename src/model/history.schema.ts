import { z } from "zod/v4";
import type { HistoryChartMetadata } from "./history.js";
import { opportunityKeySchema } from "./opportunities.schema.js";
import { positionKeySchema } from "./positions.schema.js";
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
 * {@link PoolPositionHistoryMetric}
 **/
export const poolPositionHistoryMetricSchema = z.union([
  z.literal("depositApy"),
  z.literal("borrowApy"),
  z.literal("dieselRate"),
  z.literal("supplied"),
  z.literal("borrowed"),
  z.literal("availableLiquidity"),
]);

/**
 * {@link StrategyPositionHistoryMetric}
 **/
export const strategyPositionHistoryMetricSchema = z.union([
  z.literal("netApy"),
  z.literal("borrowApy"),
  z.literal("collateralApy"),
  z.literal("tvl"),
  z.literal("collateralPrice"),
  z.literal("collateralUsdPrice"),
  z.literal("underlyingUsdPrice"),
]);

/**
 * {@link PositionHistoryMetric}
 **/
export const positionHistoryMetricSchema = z.union([
  poolPositionHistoryMetricSchema,
  strategyPositionHistoryMetricSchema,
]);

/**
 * {@link HistoryMetric}
 **/
export const historyMetricSchema = z.union([
  poolHistoryMetricSchema,
  strategyHistoryMetricSchema,
  positionHistoryMetricSchema,
]);

/**
 * {@link HistoryPoint}
 **/
export const historyPointSchema = z.object({
  timestamp: timestampSchema,
  value: z.number(),
});

/**
 * {@link HistoryChartMetadata}
 *
 * TODO: empty until the backend specifies the payload.
 **/
export const historyChartMetadataSchema: z.ZodType<HistoryChartMetadata> =
  z.object({});

/**
 * {@link HistorySeries}
 **/
export const historySeriesSchema = z.object({
  metric: historyMetricSchema,
  points: z.array(historyPointSchema),
  metadata: historyChartMetadataSchema,
});

/**
 * {@link OpportunityHistoryQuery}
 **/
export const opportunityHistoryQuerySchema = z.object({
  opportunity: opportunityKeySchema,
  range: historyRangeSchema,
  metric: historyMetricSchema,
});

/**
 * {@link PositionHistoryQuery}
 **/
export const positionHistoryQuerySchema = z.object({
  position: positionKeySchema,
  range: historyRangeSchema,
  metric: positionHistoryMetricSchema,
});
