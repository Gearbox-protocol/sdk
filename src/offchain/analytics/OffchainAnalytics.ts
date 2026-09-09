import { z } from "zod/v4";
import { analyticsChartQuerySchema } from "../../model/analytics.schema.js";
import type {
  ChartBundle,
  ChartRange,
  ProtocolChartMetric,
} from "../../model/charts.js";
import { chartBundleSchemaFor } from "../../model/charts.schema.js";
import type { ChainScopedFilter } from "../../model/filters.js";
import type { DataResponse } from "../../model/response.js";
import { AbstractOffchainNamespace } from "../AbstractOffchainNamespace.js";
import type { GearboxAPIOptions } from "../types.js";
import { OffchainAnalyticsPositions } from "./OffchainAnalyticsPositions.js";
import type { IOffchainAnalytics } from "./types.js";

/**
 * Backend-only protocol analytics, grouped by subject.
 *
 * It owns the protocol-wide charts itself rather than through a sub-namespace:
 * their subject is Gearbox as a whole, so there is nothing narrower for them to
 * hang off.
 **/
export class OffchainAnalytics
  extends AbstractOffchainNamespace
  implements IOffchainAnalytics
{
  public readonly positions: OffchainAnalyticsPositions;

  constructor(options: GearboxAPIOptions) {
    super("OffchainAnalytics", options);
    this.positions = new OffchainAnalyticsPositions(options);
  }

  /** {@inheritDoc IOffchainAnalytics.getCharts} */
  public async getCharts<const Metrics extends readonly ProtocolChartMetric[]>(
    metrics: Metrics,
    range: ChartRange,
    filter?: ChainScopedFilter,
  ): Promise<DataResponse<ChartBundle<Metrics>>> {
    return this.get({
      path: "/v2/analytics/charts",
      // the encode direction of the same codec the backend validates with
      query: z.encode(analyticsChartQuerySchema, {
        metrics,
        range,
        chainIds: this.scopedChainIds(filter),
      }),
      schema: chartBundleSchemaFor(metrics, range),
    });
  }
}
