import type {
  ChartBundle,
  ChartRange,
  PoolOpportunityChartMetric,
  StrategyOpportunityChartMetric,
} from "../../model/charts.js";
import type {
  Opportunity,
  OpportunityFilter,
  OpportunityKey,
  OpportunityTotals,
  PoolOpportunityDetail,
  PoolOpportunityKey,
  StrategyOpportunityDetail,
  StrategyOpportunityKey,
} from "../../model/opportunities.js";
import type { DataResponse } from "../../model/response.js";

export type OpportunityChartMetricFor<K extends OpportunityKey> = {
  pool: PoolOpportunityChartMetric;
  strategy: StrategyOpportunityChartMetric;
}[K["kind"]];

/**
 * Backend counterpart of the `opportunities` namespace.
 **/
export interface IOffchainOpportunities {
  /**
   * Opportunities of the chains this client covers, optionally narrowed further
   * by {@link OpportunityFilter}.
   **/
  list(filter?: OpportunityFilter): Promise<DataResponse<Opportunity[]>>;
  /**
   * Detailed view of one pool opportunity.
   **/
  getPool(
    key: PoolOpportunityKey,
  ): Promise<DataResponse<PoolOpportunityDetail>>;
  /**
   * Detailed view of one strategy opportunity.
   **/
  getStrategy(
    key: StrategyOpportunityKey,
  ): Promise<DataResponse<StrategyOpportunityDetail>>;
  /**
   * Protocol-wide totals across every opportunity the backend serves.
   **/
  getTotals(): Promise<DataResponse<OpportunityTotals>>;
  /**
   * Charts of one opportunity: one series per metric, on a shared grid.
   **/
  getCharts<
    K extends OpportunityKey,
    const Metrics extends readonly OpportunityChartMetricFor<K>[],
  >(
    key: K,
    metrics: Metrics,
    range: ChartRange,
  ): Promise<DataResponse<ChartBundle<Metrics>>>;
}
