import { z } from "zod";

import { finiteNumberSchema, timestampSchema } from "./common.js";
import type {
  HistoryMetric,
  HistoryPoint,
  HistoryRange,
  HistorySeries,
  PoolHistoryMetric,
  StrategyHistoryMetric,
} from "./types.js";

export const historyRangeSchema = z.enum([
  "1d",
  "1w",
  "1m",
  "1y",
  "max",
]) satisfies z.ZodType<HistoryRange>;

export const poolHistoryMetricSchema = z.enum([
  "depositApy",
  "borrowApy",
  "dieselRate",
  "supplied",
  "borrowed",
  "availableLiquidity",
]) satisfies z.ZodType<PoolHistoryMetric>;

/**
 * `collateralPrice` is the collateral/underlying series the liquidation chart
 * draws, so the oracles block reuses it and only adds the two USD pairs.
 */
export const strategyHistoryMetricSchema = z.enum([
  "netApy",
  "borrowApy",
  "collateralApy",
  "tvl",
  "collateralPrice",
  "collateralUsdPrice",
  "underlyingUsdPrice",
]) satisfies z.ZodType<StrategyHistoryMetric>;

export const historyMetricSchema = z.union([
  poolHistoryMetricSchema,
  strategyHistoryMetricSchema,
]) satisfies z.ZodType<HistoryMetric>;

export const historyPointSchema = z.object({
  timestamp: timestampSchema,
  value: finiteNumberSchema,
}) satisfies z.ZodType<HistoryPoint>;

/** The metric name defines the unit, so no unit field ships. */
export const historySeriesSchema = z
  .object({
    metric: historyMetricSchema,
    points: z.array(historyPointSchema),
  })
  .superRefine((series, ctx) => {
    for (let index = 1; index < series.points.length; index += 1) {
      if (
        series.points[index].timestamp <= series.points[index - 1].timestamp
      ) {
        ctx.addIssue({
          code: "custom",
          message: "History points must have strictly increasing timestamps",
          path: ["points", index, "timestamp"],
        });
      }
    }
  }) satisfies z.ZodType<HistorySeries>;

export const historySeriesListSchema = z.array(
  historySeriesSchema,
) satisfies z.ZodType<HistorySeries[]>;
