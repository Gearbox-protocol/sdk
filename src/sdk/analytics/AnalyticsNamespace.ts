import type {
  ChartBundle,
  ChartRange,
  ProtocolChartMetric,
} from "../../model/charts.js";
import type { ChainScopedFilter } from "../../model/filters.js";
import type { DataResponse } from "../../model/response.js";
import type { GearboxAPI } from "../../offchain/index.js";
import type { IAnalytics } from "./types.js";

/** Backend-only protocol analytics exposed by {@link GearboxSDK}. */
export class AnalyticsNamespace implements IAnalytics {
  public readonly positions: GearboxAPI["analytics"]["positions"];

  readonly #backend: GearboxAPI;

  constructor(backend: GearboxAPI) {
    this.#backend = backend;
    this.positions = backend.analytics.positions;
  }

  /** {@inheritDoc IAnalytics.charts} */
  public async charts<const Metrics extends readonly ProtocolChartMetric[]>(
    metrics: Metrics,
    range: ChartRange,
    filter?: ChainScopedFilter,
  ): Promise<DataResponse<ChartBundle<Metrics>>> {
    return this.#backend.analytics.getCharts(metrics, range, filter);
  }
}
