import type { Address } from "viem";
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
import { iMidasIssuanceVaultV310Abi } from "../market/adapters/abi/targetContractAbi.js";
import type { PluginsMap } from "../plugins/index.js";
import type { IMultichainOpportunitiesService } from "./types.js";

/**
 * Cross-chain counterpart of {@link OpportunitiesService}. List and detail
 * reads walk loaded market state; the mGLOBAL window reads live vault state.
 *
 * @typeParam Plugins - Map of attached plugin types.
 **/
export class MultichainOpportunitiesService<
    const Plugins extends PluginsMap = {},
  >
  extends MultichainConstruct<Plugins>
  implements IMultichainOpportunitiesService
{
  /** {@inheritDoc IMultichainOpportunitiesService.isMGLOBALInvestmentWindowOpen} */
  public async isMGLOBALInvestmentWindowOpen(): Promise<boolean> {
    return !(await this.sdk.chain("Mainnet").client.readContract({
      address: "0xCe29c36c6D4556f2d01d79414C1354B968dDDEf1",
      abi: iMidasIssuanceVaultV310Abi,
      functionName: "paused",
    }));
  }

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

  /**
   * {@inheritDoc OpportunitiesService.isEligibleForStrategy}
   **/
  public async isEligibleForStrategy(
    key: StrategyOpportunityKey,
    wallet: Address,
  ): Promise<boolean> {
    return this.sdk
      .chain(key.chainId)
      .opportunities.isEligibleForStrategy(key, wallet);
  }
}
