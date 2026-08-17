import type {
  ChainId,
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
import type { MultichainSDK, OnchainSDK } from "../../sdk/index.js";
import { AbstractNamespace } from "../AbstractNamespace.js";
import { SourceUnavailableError } from "../errors/index.js";
import { ExecuteApi } from "../execute/index.js";
import { onchainOnly, SimulateApi } from "../simulate/index.js";
import type { NamespaceOptions } from "../types.js";
import type { HistoryReader } from "../utils/index.js";
import {
  filterResponse,
  mergeChainList,
  mergeChainOne,
} from "../utils/index.js";
import type {
  OpportunitiesBase,
  OpportunitiesOffchainOnly,
  OpportunitiesOnchainOnly,
  OpportunityMergers,
} from "./types.js";

/**
 * The `opportunities` namespace of a {@link GearboxSDK}, see
 * {@link OpportunitiesByMode} for what each mode offers.
 **/
// the class implements the methods of every mode; `GearboxSDK` exposes it as its
// mode's slice of `OpportunitiesByMode`, so calling a method the mode does not
// have is a compile error rather than a runtime one
export class OpportunitiesNamespace
  extends AbstractNamespace<
    MultichainSDK["opportunities"],
    GearboxAPI["opportunities"]
  >
  implements
    OpportunitiesBase,
    OpportunitiesOffchainOnly,
    OpportunitiesOnchainOnly
{
  /**
   * {@inheritDoc OpportunitiesOnchainOnly.simulate}
   **/
  public readonly simulate: SimulateApi;

  /**
   * {@inheritDoc OpportunitiesOnchainOnly.execute}
   **/
  public readonly execute: ExecuteApi;

  /**
   * {@inheritDoc OpportunitiesBase.merge}
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
    // the simulations own no sources of their own: they run on this
    // namespace's on-chain SDK, one chain per request, and report the block
    // that chain answered from — see `onchainOnly`
    const chainOf = (chainId: ChainId): OnchainSDK => {
      if (!onchain) {
        throw new SourceUnavailableError("Opportunities", "onchain");
      }
      return onchain.chain(chainId);
    };
    this.simulate = new SimulateApi(
      onchainOnly(onchain, options.logger, options.ensureFresh),
      chainOf,
    );
    // the write side runs on the same chain resolver: what `simulate` priced,
    // `execute` encodes
    this.execute = new ExecuteApi(chainOf);
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
      chainIds: filter?.chainIds,
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
      chainIds: [key.chainId],
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
      chainIds: [key.chainId],
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
