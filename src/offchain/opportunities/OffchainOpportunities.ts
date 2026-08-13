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
import { AbstractOffchainNamespace } from "../AbstractOffchainNamespace.js";
import type { GearboxAPIOptions, OffchainResult } from "../types.js";

/**
 * Backend counterpart of the `opportunities` namespace.
 **/
export class OffchainOpportunities extends AbstractOffchainNamespace {
  readonly #root = "/v2/opportunities";

  constructor(options?: GearboxAPIOptions) {
    super("OffchainOpportunities", options);
  }

  /**
   * All opportunities the backend knows about, optionally narrowed by
   * {@link OpportunityFilter}.
   **/
  public async list(
    filter?: OpportunityFilter,
  ): Promise<OffchainResult<Opportunity[]>> {
    return this.get({
      path: this.#root,
      // the encode direction of the same codec the backend validates with
      query: filter
        ? z.encode(opportunityFilterQuerySchema, filter)
        : undefined,
      schema: z.array(opportunitySchema),
    });
  }

  /**
   * Detailed view of one pool opportunity.
   **/
  public async getPool(
    key: PoolOpportunityKey,
  ): Promise<OffchainResult<PoolOpportunityDetail>> {
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
  ): Promise<OffchainResult<StrategyOpportunityDetail>> {
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
  ): Promise<OffchainResult<HistorySeries<M>>> {
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
