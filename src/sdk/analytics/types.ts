import type {
  ChartBundle,
  ChartRange,
  ProtocolChartMetric,
} from "../../model/charts.js";
import type { ChainScopedFilter } from "../../model/filters.js";
import type { DataResponse } from "../../model/response.js";
import type { IOffchainAnalyticsPositions } from "../../offchain/index.js";

/** Backend-only protocol analytics, grouped by subject. */
export interface IAnalytics {
  readonly positions: IOffchainAnalyticsPositions;
  /**
   * Charts of the protocol as a whole: one series per metric named, onto the
   * one grid that lets them be compared at an index.
   *
   * ```ts
   * const { data } = await sdk.analytics.charts(["tvlUsd"], "1m");
   * ```
   *
   * The series sums the chains the read covers, which are this instance's own
   * narrowed by `filter` — so an SDK built for one chain charts that chain,
   * not the protocol.
   **/
  charts<const Metrics extends readonly ProtocolChartMetric[]>(
    metrics: Metrics,
    range: ChartRange,
    filter?: ChainScopedFilter,
  ): Promise<DataResponse<ChartBundle<Metrics>>>;
}

/** `sdk.analytics` per mode: absent when the SDK has no backend source. */
export interface IAnalyticsByMode {
  onchain: undefined;
  offchain: IAnalytics;
  both: IAnalytics;
}
