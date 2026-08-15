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
 * Cross-chain counterpart of {@link OpportunitiesService}.
 *
 * Fans out over every chain configured in {@link MultichainSDK}. A chain that
 * fails is logged and skipped so one dead RPC does not empty the list; its
 * failure is reported in `meta.chains`.
 *
 * Every read walks loaded market state, so the block it reports is the SDK's
 * snapshot rather than a freshly fetched head.
 *
 * Detail reads need no fan-out: an opportunity key names its chain.
 *
 * @typeParam Plugins - Map of attached plugin types.
 **/
export class MultichainOpportunitiesService<
  const Plugins extends PluginsMap = {},
> extends MultichainConstruct<Plugins> {
  /**
   * Opportunities of all queried chains, see {@link OpportunitiesService.list}.
   *
   * A filter that names chains narrows the fan-out itself, so chains whose rows
   * would be discarded are never queried and never appear in the meta.
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
   * Throws when the chain cannot answer: there is no partial stand-in for one
   * opportunity, so only a caller with a second source can degrade this.
   **/
  public async getPool(
    key: PoolOpportunityKey,
  ): Promise<DataResponse<PoolOpportunityDetail>> {
    return this.queryChain({
      network: key.chainId,
      label: "get pool opportunity",
      run: sdk => sdk.opportunities.getPool(key),
    });
  }

  /**
   * {@inheritDoc OpportunitiesService.getStrategy}
   *
   * Throws when the chain cannot answer, see
   * {@link MultichainOpportunitiesService.getPool}.
   **/
  public async getStrategy(
    key: StrategyOpportunityKey,
  ): Promise<DataResponse<StrategyOpportunityDetail>> {
    return this.queryChain({
      network: key.chainId,
      label: "get strategy opportunity",
      run: sdk => sdk.opportunities.getStrategy(key),
    });
  }
}
