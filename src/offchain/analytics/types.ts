import type {
  AnalyticsPositionListOptions,
  AnalyticsPositionPage,
} from "../../model/analytics.js";
import type {
  ChartBundle,
  ChartRange,
  ProtocolChartMetric,
} from "../../model/charts.js";
import type { ChainScopedFilter } from "../../model/filters.js";
import type { DataResponse } from "../../model/response.js";

/** Protocol-wide position reads served by the backend. */
export interface IOffchainAnalyticsPositions {
  /**
   * Every current position in the protocol, with its owning borrower, after
   * applying the requested filter, ordering and pagination.
   **/
  list(
    options?: AnalyticsPositionListOptions,
  ): Promise<DataResponse<AnalyticsPositionPage>>;
}

/** Backend-only protocol analytics, grouped by subject. */
export interface IOffchainAnalytics {
  readonly positions: IOffchainAnalyticsPositions;
  /**
   * Charts of the protocol as a whole: one series per metric named, onto the
   * one grid that lets them be compared at an index.
   *
   * The series sums the chains the read covers, which are the client's own
   * narrowed by `filter` — so a client built for one chain charts that chain,
   * not the protocol.
   **/
  getCharts<const Metrics extends readonly ProtocolChartMetric[]>(
    metrics: Metrics,
    range: ChartRange,
    filter?: ChainScopedFilter,
  ): Promise<DataResponse<ChartBundle<Metrics>>>;
}
