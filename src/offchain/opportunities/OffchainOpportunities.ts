import { z } from "zod/v4";
import type {
  HistoryMetric,
  HistorySeries,
  OpportunityHistoryQuery,
} from "../../model/history.js";
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
  // the chains are always named, even when the filter does not: the backend
  // serves chains this client has no business showing
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
   * One historical series of one opportunity
   **/
  public async getHistory<M extends HistoryMetric>(
    query: OpportunityHistoryQuery<M>,
  ): Promise<DataResponse<HistorySeries<M>>> {
    return this.readHistory({
      path: `${this.#historyRoot(query.opportunity)}/history/${query.metric}`,
      metric: query.metric,
      range: query.range,
    });
  }

  #poolPath(key: PoolOpportunityKey): string {
    return `${this.#root}/pools/${key.chainId}/${key.pool}`;
  }

  #strategyPath(key: StrategyOpportunityKey): string {
    return `${this.#root}/strategies/${key.chainId}/${key.creditManager}/${key.targetCollateral}`;
  }

  #historyRoot(key: OpportunityKey): string {
    return key.kind === "pool" ? this.#poolPath(key) : this.#strategyPath(key);
  }
}
