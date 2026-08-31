import type { Address } from "viem";
import { z } from "zod/v4";
import type { ChartBundle, ChartRange } from "../../model/charts.js";
import type {
  PoolPositionKey,
  Position,
  PositionKey,
  PositionsTotals,
  PositionTransaction,
  StrategyPositionKey,
} from "../../model/positions.js";
import {
  positionFilterQuerySchema,
  positionSchema,
  positionsTotalsSchema,
  positionTransactionSchema,
} from "../../model/positions.schema.js";
import type { DataResponse } from "../../model/response.js";
import type { ListPositionsPropsBase } from "../../onchain/positions/types.js";
import { AbstractOffchainNamespace } from "../AbstractOffchainNamespace.js";
import type { GearboxAPIOptions } from "../types.js";
import type { IOffchainPositions, PositionChartMetricFor } from "./types.js";

/**
 * Backend counterpart of the `positions` namespace.
 **/
export class OffchainPositions
  extends AbstractOffchainNamespace
  implements IOffchainPositions
{
  readonly #root = "/v2/positions";

  constructor(options: GearboxAPIOptions) {
    super("OffchainPositions", options);
  }

  /**
   * {@inheritDoc IOffchainPositions.list}
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
   * {@inheritDoc IOffchainPositions.getTotals}
   **/
  public async getTotals(
    wallet: Address,
  ): Promise<DataResponse<PositionsTotals>> {
    return this.get({
      path: `${this.#root}/${wallet}/totals`,
      schema: positionsTotalsSchema,
    });
  }

  /**
   * {@inheritDoc IOffchainPositions.getCharts}
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

  /**
   * {@inheritDoc IOffchainPositions.getTransactions}
   **/
  public async getTransactions(
    key: StrategyPositionKey,
  ): Promise<DataResponse<PositionTransaction[]>> {
    return this.get({
      path: `${this.#strategyPath(key)}/transactions`,
      schema: z.array(positionTransactionSchema),
    });
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
