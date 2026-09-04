import type {
  ChartBundle,
  ChartRange,
  DataResponse,
  Opportunity,
  OpportunityChartMetric,
  OpportunityFilter,
  OpportunityKey,
  OpportunityTotals,
  PoolOpportunityChartMetric,
  PoolOpportunityDetail,
  PoolOpportunityKey,
  PoolOpportunityRef,
  StrategyOpportunityChartMetric,
  StrategyOpportunityDetail,
  StrategyOpportunityKey,
  StrategyOpportunityRef,
} from "../../model/index.js";
import { matchesOpportunityFilter } from "../../model/index.js";
import type { GearboxAPI } from "../../offchain/index.js";
import type { MultichainSDK } from "../../onchain/index.js";
import { AbstractNamespace } from "../AbstractNamespace.js";
import { SourceUnavailableError } from "../errors/index.js";
import { ExecuteApi, type IOpportunitiesExecute } from "../execute/index.js";
import type { IOpportunitiesPrepare } from "../prepare/index.js";
import { PrepareApi } from "../prepare/index.js";
import type { NamespaceOptions } from "../types.js";
import type { FilterResult } from "../utils/index.js";
import {
  filterResponse,
  mergeChainList,
  mergeChainOne,
} from "../utils/index.js";
import type {
  IOpportunitiesBase,
  IOpportunitiesOffchainBranch,
  IOpportunitiesOffchainOnly,
  IOpportunitiesOnchainBranch,
  IOpportunitiesOnchainOnly,
  IOpportunityMergers,
} from "./types.js";

/**
 * The `opportunities` namespace of a {@link GearboxSDK}, see
 * {@link IOpportunitiesByMode} for what each mode offers.
 **/
export class OpportunitiesNamespace
  extends AbstractNamespace<
    MultichainSDK["opportunities"],
    GearboxAPI["opportunities"]
  >
  implements
    IOpportunitiesBase,
    IOpportunitiesOffchainOnly,
    IOpportunitiesOnchainOnly,
    IOpportunitiesOnchainBranch,
    IOpportunitiesOffchainBranch
{
  /**
   * {@inheritDoc IOpportunitiesBase.merge}
   **/
  public readonly merge: IOpportunityMergers = {
    list: (onchain, offchain) =>
      mergeChainList(onchain, offchain, this.maxOffchainLagSeconds),
    pool: (onchain, offchain) =>
      mergeChainOne(onchain, offchain, this.maxOffchainLagSeconds),
    strategy: (onchain, offchain) =>
      mergeChainOne(onchain, offchain, this.maxOffchainLagSeconds),
  };

  // preparing an operation reads the whole chain SDK — accounts, pools and the
  // pathfinder — rather than the `opportunities` service this namespace merges,
  // so they are built from the source itself and are absent without it; the
  // write side resolves its chain the same way
  readonly #prepare?: PrepareApi;
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
    this.#prepare = onchain && new PrepareApi(onchain, options.ensureFresh);
    this.#execute =
      onchain && new ExecuteApi(chainId => onchain.chain(chainId));
  }

  /**
   * {@inheritDoc IOpportunitiesOnchainOnly.prepare}
   **/
  public get prepare(): IOpportunitiesPrepare {
    if (!this.#prepare) {
      throw new SourceUnavailableError("Opportunities", "onchain");
    }
    return this.#prepare;
  }

  /**
   * {@inheritDoc IOpportunitiesOnchainOnly.execute}
   **/
  public get execute(): IOpportunitiesExecute {
    if (!this.#execute) {
      throw new SourceUnavailableError("Opportunities", "onchain");
    }
    return this.#execute;
  }

  /**
   * {@inheritDoc IOpportunitiesBase.list}
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
   * {@inheritDoc IOpportunitiesBase.getPool}
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
   * {@inheritDoc IOpportunitiesBase.getStrategy}
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
   * {@inheritDoc IOpportunitiesBase.filter}
   **/
  public filter<R extends DataResponse<Opportunity[]> | undefined>(
    response: R,
    filter?: OpportunityFilter,
  ): FilterResult<R, Opportunity> {
    return filterResponse(response, filter, matchesOpportunityFilter);
  }

  /**
   * {@inheritDoc IOpportunitiesOffchainOnly.totals}
   **/
  public async totals(): Promise<DataResponse<OpportunityTotals>> {
    return this.offchain.getTotals();
  }

  /**
   * {@inheritDoc IOpportunitiesOffchainOnly.charts}
   **/
  public charts<const Metrics extends readonly PoolOpportunityChartMetric[]>(
    key: PoolOpportunityRef,
    metrics: Metrics,
    range: ChartRange,
  ): Promise<DataResponse<ChartBundle<Metrics>>>;
  public charts<
    const Metrics extends readonly StrategyOpportunityChartMetric[],
  >(
    key: StrategyOpportunityRef,
    metrics: Metrics,
    range: ChartRange,
  ): Promise<DataResponse<ChartBundle<Metrics>>>;
  public async charts<const Metrics extends readonly OpportunityChartMetric[]>(
    key: OpportunityKey,
    metrics: Metrics,
    range: ChartRange,
  ): Promise<DataResponse<ChartBundle<Metrics>>> {
    return this.offchain.getCharts(key, metrics, range);
  }
}
