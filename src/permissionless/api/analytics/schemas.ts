import { z } from "zod/v4";
import { CHART_RANGES } from "../../../model/charts.js";

/**
 * Runtime schemas for {@link ./types.js}.
 *
 * Loose for the same reason the oracles schemas are: the backend assembles
 * these rows from its own indexes and may report more about a window than the
 * hand-written types declare.
 **/

/** {@link PriceFeedChartPoint} */
export const priceFeedChartPointSchema = z.looseObject({
  timestamp: z.number(),
  value: z.number(),
});

/** {@link PriceFeedPriceChart} */
export const priceFeedChartSchema = z.looseObject({
  range: z.enum(CHART_RANGES),
  from: z.number(),
  to: z.number(),
  intervalSeconds: z.number(),
  points: z.array(priceFeedChartPointSchema),
});
