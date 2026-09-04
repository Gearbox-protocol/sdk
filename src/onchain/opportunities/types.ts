import type {
  DataResponse,
  Opportunity,
  OpportunityFilter,
  PoolOpportunityDetail,
  PoolOpportunityKey,
  StrategyOpportunityDetail,
  StrategyOpportunityKey,
} from "../../model/index.js";

/**
 * Cross-chain reads of the opportunities namespace: every pool and strategy
 * the loaded markets expose.
 **/
export interface IMultichainOpportunitiesService {
  /**
   * Opportunities of all queried chains. A filter that names chains narrows
   * the fan-out itself, so a chain whose rows would be discarded is never
   * queried and never appears in the meta.
   **/
  list(filter?: OpportunityFilter): Promise<DataResponse<Opportunity[]>>;
  /**
   * Detailed view of one pool opportunity. The key names its chain, so there
   * is no fan-out. Throws when that chain cannot answer.
   **/
  getPool(
    key: PoolOpportunityKey,
  ): Promise<DataResponse<PoolOpportunityDetail>>;
  /**
   * Detailed view of one strategy opportunity. See {@link getPool}.
   **/
  getStrategy(
    key: StrategyOpportunityKey,
  ): Promise<DataResponse<StrategyOpportunityDetail>>;
}
