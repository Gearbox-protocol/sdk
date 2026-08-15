import type {
  DataResponse,
  HistoryRange,
  Opportunity,
  OpportunityFilter,
  OpportunityKey,
  PoolHistoryMetric,
  PoolOpportunityDetail,
  PoolOpportunityKey,
  PoolOpportunityRef,
  StrategyHistoryMetric,
  StrategyOpportunityDetail,
  StrategyOpportunityKey,
  StrategyOpportunityRef,
} from "../../model/index.js";
import { matchesOpportunityFilter } from "../../model/index.js";
import type { GearboxAPI } from "../../offchain/index.js";
import type { MultichainSDK } from "../../sdk/index.js";
import { AbstractNamespace } from "../AbstractNamespace.js";
import { mergeChainList, mergeChainOne } from "../merge/index.js";
import type { NamespaceOptions } from "../types.js";
import type { HistoryReader } from "../utils/index.js";
import { filterResponse } from "../utils/index.js";
import type {
  OpportunitiesBase,
  OpportunitiesMerged,
  OpportunitiesOffchainOnly,
  OpportunityMergers,
} from "./types.js";

/**
 * The `opportunities` namespace of the combined SDK.
 *
 * A stateless router over the two sources, see {@link AbstractNamespace} for the
 * routing itself. What is specific to opportunities is the reads below and the
 * mergers they name.
 *
 * The class implements the methods of every mode; {@link GearboxSDK} exposes it
 * as its mode's slice of {@link OpportunitiesByMode}, so calling a method the
 * mode does not have is a compile error rather than a runtime one.
 **/
export class OpportunitiesNamespace
  extends AbstractNamespace<
    MultichainSDK["opportunities"],
    GearboxAPI["opportunities"]
  >
  implements OpportunitiesBase, OpportunitiesOffchainOnly, OpportunitiesMerged
{
  /**
   * {@inheritDoc OpportunitiesMerged.merge}
   **/
  public readonly merge: OpportunityMergers = {
    list: (onchain, offchain) =>
      mergeChainList(onchain, offchain, this.maxOffchainLagSeconds),
    pool: (onchain, offchain) =>
      mergeChainOne(onchain, offchain, this.maxOffchainLagSeconds),
    strategy: (onchain, offchain) =>
      mergeChainOne(onchain, offchain, this.maxOffchainLagSeconds),
  };

  constructor(
    onchain: MultichainSDK | undefined,
    offchain: GearboxAPI | undefined,
    options: NamespaceOptions,
  ) {
    super(
      "Opportunities",
      onchain?.opportunities,
      offchain?.opportunities,
      options,
    );
  }

  /**
   * {@inheritDoc OpportunitiesBase.list}
   **/
  public async list(
    filter?: OpportunityFilter,
  ): Promise<DataResponse<Opportunity[]>> {
    // the filter goes to both sources as it was given: each one scopes the
    // request to the chains it covers itself
    return this.merged("list opportunities", {
      scope: filter?.chainIds,
      fromChain: source => source.list(filter),
      fromBackend: source => source.list(filter),
      merge: this.merge.list,
    });
  }

  /**
   * {@inheritDoc OpportunitiesBase.getPool}
   **/
  public async getPool(
    key: PoolOpportunityKey,
  ): Promise<DataResponse<PoolOpportunityDetail>> {
    return this.merged("get pool opportunity", {
      scope: [key.chainId],
      fromChain: source => source.getPool(key),
      fromBackend: source => source.getPool(key),
      merge: this.merge.pool,
    });
  }

  /**
   * {@inheritDoc OpportunitiesBase.getStrategy}
   **/
  public async getStrategy(
    key: StrategyOpportunityKey,
  ): Promise<DataResponse<StrategyOpportunityDetail>> {
    return this.merged("get strategy opportunity", {
      scope: [key.chainId],
      fromChain: source => source.getStrategy(key),
      fromBackend: source => source.getStrategy(key),
      merge: this.merge.strategy,
    });
  }

  /**
   * {@inheritDoc OpportunitiesBase.filter}
   **/
  public filter(
    response: DataResponse<Opportunity[]> | undefined,
    filter?: OpportunityFilter,
  ): DataResponse<Opportunity[]> | undefined {
    return filterResponse(response, filter, matchesOpportunityFilter);
  }

  /**
   * {@inheritDoc OpportunitiesOffchainOnly.history}
   **/
  public history(key: PoolOpportunityRef): HistoryReader<PoolHistoryMetric>;
  public history(
    key: StrategyOpportunityRef,
  ): HistoryReader<StrategyHistoryMetric>;
  public history(
    key: OpportunityKey,
  ): HistoryReader<PoolHistoryMetric> | HistoryReader<StrategyHistoryMetric> {
    // nothing is fetched here: the reader is a view over the backend read, so
    // each chart is requested on its own, when it is asked for
    return {
      chart: (metric: PoolHistoryMetric, range: HistoryRange) =>
        this.offchain.getHistory({ opportunity: key, range, metric }),
    };
  }
}
