import type { Address } from "viem";
import type {
  ChartBundle,
  ChartRange,
  PoolPositionChartMetric,
  StrategyPositionChartMetric,
} from "../../model/charts.js";
import type {
  Position,
  PositionKey,
  PositionsTotals,
} from "../../model/positions.js";
import type { DataResponse } from "../../model/response.js";
import type { ListPositionsPropsBase } from "../../onchain/positions/types.js";

export type PositionChartMetricFor<K extends PositionKey> = {
  pool: PoolPositionChartMetric;
  strategy: StrategyPositionChartMetric;
}[K["kind"]];

/**
 * Backend counterpart of the `positions` namespace.
 **/
export interface IOffchainPositions {
  /**
   * Everything a wallet holds, optionally narrowed by the filter on
   * {@link ListPositionsPropsBase}.
   **/
  list(props: ListPositionsPropsBase): Promise<DataResponse<Position[]>>;
  /**
   * Aggregate over everything a wallet holds, see {@link PositionsTotals}.
   **/
  getTotals(wallet: Address): Promise<DataResponse<PositionsTotals>>;
  /**
   * Charts of one position: one series per metric, on a shared grid.
   **/
  getCharts<
    K extends PositionKey,
    const Metrics extends readonly PositionChartMetricFor<K>[],
  >(
    key: K,
    metrics: Metrics,
    range: ChartRange,
  ): Promise<DataResponse<ChartBundle<Metrics>>>;
}
