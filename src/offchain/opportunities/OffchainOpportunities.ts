import { z } from "zod/v4";
import type { ChartBundle, ChartRange } from "../../model/charts.js";
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
import {
  opportunityFilterQuerySchema,
  opportunitySchema,
  opportunityTotalsSchema,
  poolOpportunityDetailSchema,
  strategyOpportunityDetailSchema,
} from "../../model/opportunities.schema.js";
import type { DataResponse } from "../../model/response.js";
import { AbstractOffchainNamespace } from "../AbstractOffchainNamespace.js";
import type { GearboxAPIOptions } from "../types.js";
import type {
  IOffchainOpportunities,
  OpportunityChartMetricFor,
} from "./types.js";

/**
 * Backend counterpart of the `opportunities` namespace.
 **/
export class OffchainOpportunities
  extends AbstractOffchainNamespace
  implements IOffchainOpportunities
{
  readonly #root = "/v2/opportunities";

  constructor(options: GearboxAPIOptions) {
    super("OffchainOpportunities", options);
  }

  /**
   * {@inheritDoc IOffchainOpportunities.list}
   **/
  public async list(
    filter?: OpportunityFilter,
  ): Promise<DataResponse<Opportunity[]>> {
    return this.get({
      path: this.#root,
      // the encode direction of the same codec the backend validates with
      query: z.encode(opportunityFilterQuerySchema, {
        ...filter,
        chainIds: this.scopedChainIds(filter),
      }),
      schema: z.array(opportunitySchema),
    });
  }

  /**
   * {@inheritDoc IOffchainOpportunities.getPool}
   **/
  public async getPool(
    key: PoolOpportunityKey,
  ): Promise<DataResponse<PoolOpportunityDetail>> {
    return this.get({
      path: this.#poolPath(key),
      schema: poolOpportunityDetailSchema,
    });
  }

  /**
   * {@inheritDoc IOffchainOpportunities.getStrategy}
   **/
  public async getStrategy(
    key: StrategyOpportunityKey,
  ): Promise<DataResponse<StrategyOpportunityDetail>> {
    return this.get({
      path: this.#strategyPath(key),
      schema: strategyOpportunityDetailSchema,
    });
  }

  /**
   * {@inheritDoc IOffchainOpportunities.getTotals}
   **/
  public async getTotals(): Promise<DataResponse<OpportunityTotals>> {
    return this.get({
      path: `${this.#root}/totals`,
      schema: opportunityTotalsSchema,
    });
  }

  /**
   * {@inheritDoc IOffchainOpportunities.getCharts}
   **/
  public async getCharts<
    K extends OpportunityKey,
    const Metrics extends readonly OpportunityChartMetricFor<K>[],
  >(
    key: K,
    metrics: Metrics,
    range: ChartRange,
  ): Promise<DataResponse<ChartBundle<Metrics>>> {
    return this.readCharts(`${this.#chartRoot(key)}/charts`, metrics, range);
  }

  #poolPath(key: PoolOpportunityKey): string {
    return `${this.#root}/pools/${key.chainId}/${key.pool}`;
  }

  #strategyPath(key: StrategyOpportunityKey): string {
    return `${this.#root}/strategies/${key.chainId}/${key.creditManager}`;
  }

  #chartRoot(key: OpportunityKey): string {
    return key.kind === "pool" ? this.#poolPath(key) : this.#strategyPath(key);
  }
}
