import { z } from "zod/v4";
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
  PoolOpportunityDetail,
  PoolOpportunityKey,
  StrategyOpportunityDetail,
  StrategyOpportunityKey,
} from "../../model/opportunities.js";
import {
  opportunityFilterQuerySchema,
  opportunitySchema,
  poolOpportunityDetailSchema,
  strategyOpportunityDetailSchema,
} from "../../model/opportunities.schema.js";
import type { DataResponse } from "../../model/response.js";
import { AbstractOffchainNamespace } from "../AbstractOffchainNamespace.js";
import type { GearboxAPIOptions } from "../types.js";

type OpportunityChartMetricFor<K extends OpportunityKey> = {
  pool: PoolOpportunityChartMetric;
  strategy: StrategyOpportunityChartMetric;
}[K["kind"]];

/**
 * Backend counterpart of the `opportunities` namespace.
 **/
export class OffchainOpportunities extends AbstractOffchainNamespace {
  readonly #root = "/v2/opportunities";

  constructor(options: GearboxAPIOptions) {
    super("OffchainOpportunities", options);
  }

  /**
   * Opportunities of the chains this client covers, optionally narrowed further
   * by {@link OpportunityFilter}.
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
   * Detailed view of one pool opportunity.
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
   * Detailed view of one strategy opportunity.
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
   * Charts of one opportunity: one series per metric, on a shared grid.
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
    return `${this.#root}/strategies/${key.chainId}/${key.creditManager}/${key.targetCollateral}`;
  }

  #chartRoot(key: OpportunityKey): string {
    return key.kind === "pool" ? this.#poolPath(key) : this.#strategyPath(key);
  }
}
