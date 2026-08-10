import type {
  Opportunity,
  OpportunityFilter,
  PoolOpportunityDetail,
  PoolOpportunityKey,
  StrategyOpportunityDetail,
  StrategyOpportunityKey,
} from "../../model/index.js";
import { MultichainConstruct } from "../base/index.js";
import { getNetworkType } from "../chain/chains.js";
import type { NetworkType } from "../chain/index.js";
import type { PluginsMap } from "../plugins/index.js";
import type { MultichainResult } from "../types/index.js";

/**
 * Cross-chain counterpart of {@link OpportunitiesService}.
 *
 * Fans out over every chain configured in {@link MultichainSDK}. A chain that
 * fails is logged and skipped so one dead RPC does not empty the list; its
 * failure is reported in {@link MultichainResult.meta}.
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
  ): Promise<MultichainResult<Opportunity[]>> {
    return this.queryChains({
      networks: this.#networksOf(filter),
      label: "list opportunities",
      run: sdk => sdk.opportunities.list(filter),
    });
  }

  /**
   * {@inheritDoc OpportunitiesService.getPool}
   **/
  public async getPool(
    key: PoolOpportunityKey,
  ): Promise<PoolOpportunityDetail> {
    return this.sdk.chain(key.chainId).opportunities.getPool(key);
  }

  /**
   * {@inheritDoc OpportunitiesService.getStrategy}
   **/
  public async getStrategy(
    key: StrategyOpportunityKey,
  ): Promise<StrategyOpportunityDetail> {
    return this.sdk.chain(key.chainId).opportunities.getStrategy(key);
  }

  /**
   * Chains named by the filter, or `undefined` to query all of them. Chain ids
   * the SDK does not support are dropped here rather than reported as failures:
   * a filter naming them is a narrowing, not a request.
   **/
  #networksOf(filter?: OpportunityFilter): NetworkType[] | undefined {
    if (!filter?.chainIds) {
      return undefined;
    }
    const networks: NetworkType[] = [];
    for (const chainId of filter.chainIds) {
      try {
        networks.push(getNetworkType(chainId));
      } catch {
        this.sdk.logger?.debug(
          `ignoring unsupported chain ${chainId} in opportunities filter`,
        );
      }
    }
    return networks;
  }
}
