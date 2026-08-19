import { z } from "zod/v4";
import type {
  ChartBundle,
  ChartRange,
  PoolPositionChartMetric,
  StrategyPositionChartMetric,
} from "../../model/charts.js";
import type {
  PoolPositionKey,
  Position,
  PositionKey,
  StrategyPositionKey,
} from "../../model/positions.js";
import {
  positionFilterQuerySchema,
  positionSchema,
} from "../../model/positions.schema.js";
import type { DataResponse } from "../../model/response.js";
import type { ListPositionsPropsBase } from "../../sdk/positions/types.js";
import { AbstractOffchainNamespace } from "../AbstractOffchainNamespace.js";
import type { GearboxAPIOptions } from "../types.js";

type PositionChartMetricFor<K extends PositionKey> = {
  pool: PoolPositionChartMetric;
  strategy: StrategyPositionChartMetric;
}[K["kind"]];

/**
 * Backend counterpart of the `positions` namespace.
 **/
export class OffchainPositions extends AbstractOffchainNamespace {
  readonly #root = "/v2/positions";

  constructor(options: GearboxAPIOptions) {
    super("OffchainPositions", options);
  }

  /**
   * Everything a wallet holds, optionally narrowed by {@link PositionFilter}.
   **/
  public async list(
    props: ListPositionsPropsBase,
  ): Promise<DataResponse<Position[]>> {
    // the chains are always named, even when the filter does not: the backend
    // serves chains this client has no business showing
    return this.get({
      path: `${this.#root}/${props.wallet}`,
      // the encode direction of the same codec the backend validates with
      query: z.encode(positionFilterQuerySchema, {
        ...props.filter,
        chainIds: this.scopedChainIds(props.filter),
      }),
      schema: z.array(positionSchema),
    });
  }

  /**
   * Charts of one position: one series per metric, on a shared grid.
   *
   * @throws {OffchainNotImplementedError} Until the backend serves it. An empty
   * bundle would be the one answer this model exists to rule out: a chart that
   * could not be read is not a chart with no points.
   **/
  public async getCharts<
    K extends PositionKey,
    const Metrics extends readonly PositionChartMetricFor<K>[],
  >(
    key: K,
    metrics: Metrics,
    range: ChartRange,
  ): Promise<DataResponse<ChartBundle<Metrics>>> {
    return this.readCharts(`${this.#chartRoot(key)}/charts`, metrics, range);
  }

  #poolPath(key: PoolPositionKey): string {
    return `${this.#root}/pool/${key.chainId}/${key.pool}/${key.wallet}`;
  }

  #strategyPath(key: StrategyPositionKey): string {
    return `${this.#root}/strategy/${key.chainId}/${key.creditAccount}`;
  }

  #chartRoot(key: PositionKey): string {
    return key.kind === "pool" ? this.#poolPath(key) : this.#strategyPath(key);
  }
}
