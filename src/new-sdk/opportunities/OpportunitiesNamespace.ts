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
import { SourceUnavailableError } from "../errors/index.js";
import { ExecuteApi, type OpportunitiesExecute } from "../execute/index.js";
import type { OpportunitiesSimulate } from "../simulate/index.js";
import { SimulateApi } from "../simulate/index.js";
import type { NamespaceOptions } from "../types.js";
import type { FilterResult, HistoryReader } from "../utils/index.js";
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

  // the simulations read the whole chain SDK — accounts, pools and the
  // pathfinder — rather than the `opportunities` service this namespace merges,
  // so they are built from the source itself and are absent without it; the
  // write side resolves its chain the same way
  readonly #simulate?: SimulateApi;
  readonly #execute?: ExecuteApi;

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
    this.#simulate = onchain && new SimulateApi(onchain);
    this.#execute =
      onchain && new ExecuteApi(chainId => onchain.chain(chainId));
  }

  /**
   * {@inheritDoc OpportunitiesOnchainOnly.simulate}
   **/
  public get simulate(): OpportunitiesSimulate {
    if (!this.#simulate) {
      throw new SourceUnavailableError("Opportunities", "onchain");
    }
    return this.#simulate;
  }

  /**
   * {@inheritDoc OpportunitiesOnchainOnly.execute}
   **/
  public get execute(): OpportunitiesExecute {
    if (!this.#execute) {
      throw new SourceUnavailableError("Opportunities", "onchain");
    }
    return this.#execute;
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
  public filter<R extends DataResponse<Opportunity[]> | undefined>(
    response: R,
    filter?: OpportunityFilter,
  ): FilterResult<R, Opportunity> {
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
