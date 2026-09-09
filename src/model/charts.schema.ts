import { z } from "zod/v4";
import type {
  ChartBundle,
  ChartMetric,
  ChartQuery,
  ChartRange,
  ChartSeries,
  ChartWindow,
  GridSampling,
} from "./charts.js";
import {
  CHART_METRIC_UNITS,
  CHART_RANGES,
  CHART_UNAVAILABLE_CODES,
  POOL_OPPORTUNITY_CHART_METRICS,
  POOL_POSITION_CHART_METRICS,
  PROTOCOL_CHART_METRICS,
  STRATEGY_OPPORTUNITY_CHART_METRICS,
  STRATEGY_POSITION_CHART_METRICS,
} from "./charts.js";
import type { Timestamp } from "./primitives.js";
import { timestampSchema, tokenSchema } from "./primitives.schema.js";

/**
 * Runtime schemas for {@link ./charts.js}, see the note in
 * `primitives.schema.ts` on why they are written by hand.
 *
 * Metric schemas are shared with the backend, while
 * {@link chartBundleSchemaFor} builds the response schema for one concrete
 * request. Component schemas remain available for consumers that validate
 * model fragments.
 **/

/**
 * {@link ChartRange}
 **/
export const chartRangeSchema = z.enum(CHART_RANGES);

/**
 * {@link PoolOpportunityChartMetric}
 **/
export const poolOpportunityChartMetricSchema = z.enum(
  POOL_OPPORTUNITY_CHART_METRICS,
);

/**
 * {@link StrategyOpportunityChartMetric}
 **/
export const strategyOpportunityChartMetricSchema = z.enum(
  STRATEGY_OPPORTUNITY_CHART_METRICS,
);

/**
 * {@link PoolPositionChartMetric}
 **/
export const poolPositionChartMetricSchema = z.enum(
  POOL_POSITION_CHART_METRICS,
);

/**
 * {@link StrategyPositionChartMetric}
 **/
export const strategyPositionChartMetricSchema = z.enum(
  STRATEGY_POSITION_CHART_METRICS,
);

/**
 * {@link ProtocolChartMetric}
 **/
export const protocolChartMetricSchema = z.enum(PROTOCOL_CHART_METRICS);

/**
 * {@link ChartMetric}, every metric any subject can chart.
 **/
export const chartMetricSchema = z.union([
  poolOpportunityChartMetricSchema,
  strategyOpportunityChartMetricSchema,
  poolPositionChartMetricSchema,
  strategyPositionChartMetricSchema,
  protocolChartMetricSchema,
]);

/**
 * {@link ChartQuery}
 **/
export const chartQuerySchema = z.object({
  metrics: z
    .array(chartMetricSchema)
    .readonly()
    .refine(metrics => metrics.length > 0, {
      error: "a chart read needs at least one metric",
    })
    .refine(metrics => new Set(metrics).size === metrics.length, {
      error: "a chart read needs distinct metrics",
    }),
  range: chartRangeSchema,
});

/**
 * {@link ChartQuery} as a URL can carry it: the metrics comma-joined, since
 * repeated `?metrics=` entries would order differently between clients and give
 * one request two cache keys.
 **/
export const chartQueryParamsSchema = z.object({
  metrics: z.string().regex(/^\w+(,\w+)*$/),
  range: chartRangeSchema,
});

/**
 * Codec for {@link ChartQuery} to encode/decode to/from url query parameters.
 *
 * The one place the wire form of a chart request is decided. The SDK encodes
 * with it, the backend decodes with it, and the checks that a read names at
 * least one metric and names none of them twice ride along in both directions —
 * so a bad request fails before it is issued, not after a round trip.
 **/
export const chartQueryCodec = z.codec(
  chartQueryParamsSchema,
  chartQuerySchema,
  {
    decode: (params): ChartQuery => ({
      // members are checked by `chartQuerySchema`, which the codec applies to
      // this result; the split can only produce strings
      metrics: params.metrics.split(",") as ChartMetric[],
      range: params.range,
    }),
    encode: (query): z.input<typeof chartQueryParamsSchema> => ({
      metrics: query.metrics.join(","),
      range: query.range,
    }),
  },
);

/**
 * {@link ChartDenomination}
 **/
export const chartDenominationSchema = z.discriminatedUnion("unit", [
  z.object({ unit: z.literal("bps") }),
  z.object({ unit: z.literal("usd") }),
  z.object({ unit: z.literal("scalar") }),
  z.object({ unit: z.literal("token"), base: tokenSchema }),
  z.object({
    unit: z.literal("ratio"),
    base: tokenSchema,
    quote: tokenSchema,
  }),
]);

/**
 * {@link ChartValue}. `null` is a gap, never a zero.
 **/
export const chartValueSchema = z.number().nullable();

/**
 * {@link ChartSeries}
 **/
export const chartSeriesSchema = z.union([
  z.intersection(
    z.object({
      status: z.literal("ok"),
      values: z.array(chartValueSchema),
    }),
    chartDenominationSchema,
  ),
  z.object({
    status: z.literal("unavailable"),
    reason: z.object({
      code: z.enum(CHART_UNAVAILABLE_CODES),
      message: z.string().optional(),
    }),
  }),
]);

/**
 * {@link ChartWindow}
 **/
export const chartWindowSchema = z.object({
  range: chartRangeSchema,
  from: timestampSchema,
  to: timestampSchema,
});

const gridSamplingSchema = z.object({
  kind: z.literal("grid"),
  intervalSeconds: z.number().int().positive(),
});

/**
 * A bundle whose series are keyed by `keys`.
 *
 * `z.record` over a literal union is what enforces the metric set: a key that
 * was not asked for is rejected, and one that was but is missing fails as an
 * absent value. Exactly-once therefore needs no counting — an object cannot
 * hold the same key twice.
 **/
function chartBundleSchemaWith(
  keys: z.ZodType<ChartMetric>,
  expectedRange?: ChartRange,
) {
  return z
    .object({
      window: chartWindowSchema,
      sampling: gridSamplingSchema,
      timestamps: z.array(timestampSchema),
      series: z.record(keys, chartSeriesSchema),
    })
    .superRefine((bundle, ctx) => checkChartBundle(bundle, ctx, expectedRange));
}

/**
 * The invariants a bundle upholds beyond its shape, checked on every read so a
 * backend that breaks one is rejected rather than plotted:
 *
 * - each available series holds exactly one value per timestamp, which is what
 *   makes two series of a bundle comparable at an index;
 * - a series' unit is the one {@link CHART_METRIC_UNITS} gives the metric it is
 *   keyed by, so a consumer can format from either without them disagreeing;
 * - the window's bounds are the axis' own, so a chart drawn from `window` and a
 *   chart drawn from `timestamps` cover the same span;
 * - timestamps lie on the declared grid and are exactly one interval apart;
 * - when validating a read, the response names the range that was requested.
 **/
function checkChartBundle(
  bundle: {
    window: ChartWindow;
    sampling: GridSampling;
    timestamps: Timestamp[];
    series: Record<string, ChartSeries>;
  },
  ctx: z.core.$RefinementCtx,
  expectedRange?: ChartRange,
): void {
  const { sampling, timestamps, window, series } = bundle;
  const entries = Object.entries(series) as Array<[ChartMetric, ChartSeries]>;
  for (const [metric, chart] of entries) {
    if (chart.status !== "ok") {
      continue;
    }
    if (chart.values.length !== timestamps.length) {
      ctx.addIssue({
        code: "custom",
        path: ["series", metric, "values"],
        message: `series "${metric}" holds ${chart.values.length} values for ${timestamps.length} timestamps`,
      });
    }
    if (CHART_METRIC_UNITS[metric] !== chart.unit) {
      ctx.addIssue({
        code: "custom",
        path: ["series", metric, "unit"],
        message: `metric "${metric}" is ${CHART_METRIC_UNITS[metric]}, not ${chart.unit}`,
      });
    }
  }
  const first = timestamps.at(0);
  const last = timestamps.at(-1);
  if (first !== undefined && first !== window.from) {
    ctx.addIssue({
      code: "custom",
      path: ["window", "from"],
      message: `window starts at ${window.from} but the axis starts at ${first}`,
    });
  }
  if (last !== undefined && last !== window.to) {
    ctx.addIssue({
      code: "custom",
      path: ["window", "to"],
      message: `window ends at ${window.to} but the axis ends at ${last}`,
    });
  }
  if (expectedRange !== undefined && window.range !== expectedRange) {
    ctx.addIssue({
      code: "custom",
      path: ["window", "range"],
      message: `requested range ${expectedRange}, received ${window.range}`,
    });
  }
  for (let i = 0; i < timestamps.length; i += 1) {
    const timestamp = timestamps[i];
    if (timestamp % sampling.intervalSeconds !== 0) {
      ctx.addIssue({
        code: "custom",
        path: ["timestamps", i],
        message: `timestamp ${timestamp} is not on the ${sampling.intervalSeconds}-second grid`,
      });
    }
    const previous = timestamps[i - 1];
    if (
      previous !== undefined &&
      timestamp - previous !== sampling.intervalSeconds
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["timestamps", i],
        message: `timestamps are not ${sampling.intervalSeconds} seconds apart`,
      });
    }
  }
}

/**
 * The schema one chart read is decoded with: a {@link ChartBundle} keyed by the
 * requested distinct metrics, all of them and nothing else, for the requested
 * range.
 *
 * Pinning the metrics is what upholds the `ChartBundle<Metrics>` a caller gets
 * back — a response that answers a different question fails validation rather
 * than being cast into the requested shape. The declared return type is the one
 * the key schema actually enforces, which the compiler cannot see through a
 * schema built from a runtime list.
 **/
export function chartBundleSchemaFor<
  const Metrics extends readonly ChartMetric[],
>(metrics: Metrics, range: ChartRange): z.ZodType<ChartBundle<Metrics>> {
  if (metrics.length === 0) {
    throw new RangeError("a chart read needs at least one metric");
  }
  if (new Set(metrics).size !== metrics.length) {
    throw new RangeError("a chart read needs distinct metrics");
  }
  const literals = metrics.map(metric => z.literal(metric)) as [
    z.ZodLiteral<Metrics[number]>,
    ...z.ZodLiteral<Metrics[number]>[],
  ];
  return chartBundleSchemaWith(
    z.union(literals),
    range,
  ) as unknown as z.ZodType<ChartBundle<Metrics>>;
}
