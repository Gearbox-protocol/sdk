import type {
  DataResponse,
  Opportunity,
  OpportunityFilter,
  PoolOpportunityDetail,
  PoolOpportunityKey,
  StrategyOpportunityDetail,
  StrategyOpportunityKey,
} from "../../model/index.js";
import { MultichainConstruct } from "../base/index.js";
import type { PluginsMap } from "../plugins/index.js";

/**
 * Cross-chain counterpart of {@link OpportunitiesService}. Every read walks
 * loaded market state, so the block it reports is the SDK's snapshot.
 *
 * @typeParam Plugins - Map of attached plugin types.
 **/
export class MultichainOpportunitiesService<
  const Plugins extends PluginsMap = {},
> extends MultichainConstruct<Plugins> {
  /**
   * Opportunities of all queried chains, see {@link OpportunitiesService.list}.
   * A filter that names chains narrows the fan-out itself, so a chain whose
   * rows would be discarded is never queried and never appears in the meta.
   **/
  public async list(
    filter?: OpportunityFilter,
  ): Promise<DataResponse<Opportunity[]>> {
    return this.queryChains({
      chainIds: filter?.chainIds,
      label: "list opportunities",
      run: sdk => sdk.opportunities.list(filter),
    });
  }

  /**
   * {@inheritDoc OpportunitiesService.getPool}
   *
   * The key names its chain, so there is no fan-out. Throws when that chain
   * cannot answer.
   **/
  public async getPool(
    key: PoolOpportunityKey,
  ): Promise<DataResponse<PoolOpportunityDetail>> {
    return this.queryChain({
      network: key.chainId,
      run: sdk => sdk.opportunities.getPool(key),
    });
  }

  /**
   * {@inheritDoc OpportunitiesService.getStrategy}
   *
   * See {@link MultichainOpportunitiesService.getPool}.
   **/
  public async getStrategy(
    key: StrategyOpportunityKey,
  ): Promise<DataResponse<StrategyOpportunityDetail>> {
    return this.queryChain({
      network: key.chainId,
      run: sdk => sdk.opportunities.getStrategy(key),
    });
  }
}
