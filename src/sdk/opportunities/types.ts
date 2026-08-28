import type {
  ChartBundle,
  ChartRange,
  DataResponse,
  Opportunity,
  OpportunityFilter,
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
import type { IOffchainOpportunities } from "../../offchain/index.js";
import type { IMultichainOpportunitiesService } from "../../onchain/index.js";
import type { IOpportunitiesExecute } from "../execute/index.js";
import type { IOpportunitiesPrepare } from "../prepare/index.js";
import type { Mode } from "../types.js";
import type { EntityMerger, FilterResult, ListMerger } from "../utils/index.js";

/**
 * What the `opportunities` namespace offers in every mode.
 **/
export interface IOpportunitiesBase {
  /**
   * All pool and strategy opportunities, optionally narrowed. In `both` mode
   * each chain is served by whichever source is fresh enough, see
   * {@link IOpportunityMergers}.
   **/
  list(filter?: OpportunityFilter): Promise<DataResponse<Opportunity[]>>;
  /**
   * Detailed view of one pool opportunity.
   **/
  getPool(
    key: PoolOpportunityKey,
  ): Promise<DataResponse<PoolOpportunityDetail>>;
  /**
   * Detailed view of one strategy opportunity.
   **/
  getStrategy(
    key: StrategyOpportunityKey,
  ): Promise<DataResponse<StrategyOpportunityDetail>>;
  /**
   * Narrows an already-read list, rows and metadata alike. `undefined` passes
   * through, so a read still in flight stays that way, and a list already read
   * narrows to a list.
   **/
  filter<R extends DataResponse<Opportunity[]> | undefined>(
    response: R,
    filter?: OpportunityFilter,
  ): FilterResult<R, Opportunity>;
  /**
   * Merge policy of each read, for a consumer combining the two branches
   * itself, see {@link IOpportunityMergers}.
   **/
  readonly merge: IOpportunityMergers;
}

/**
 * Reads only a backend can answer.
 **/
export interface IOpportunitiesOffchainOnly {
  /**
   * Protocol-wide totals across every opportunity: the TVL, total borrowed and
   * total supplied the landing page shows.
   *
   * Absent in `onchain` mode: it is served by the backend rather than summed
   * from the chain.
   **/
  totals(): Promise<DataResponse<OpportunityTotals>>;
  /**
   * Historical charts of one opportunity, one series per metric on a shared
   * axis: `charts(key, ["depositApy", "depositApyAvg7d"], "1m")`.
   *
   * The key's kind decides which metrics exist, so asking a pool for a strategy
   * chart does not compile, and the bundle is keyed by exactly the metrics
   * named — one of them is a bundle of one, not a different call.
   **/
  charts<const Metrics extends readonly PoolOpportunityChartMetric[]>(
    key: PoolOpportunityRef,
    metrics: Metrics,
    range: ChartRange,
  ): Promise<DataResponse<ChartBundle<Metrics>>>;
  charts<const Metrics extends readonly StrategyOpportunityChartMetric[]>(
    key: StrategyOpportunityRef,
    metrics: Metrics,
    range: ChartRange,
  ): Promise<DataResponse<ChartBundle<Metrics>>>;
}

/**
 * Reads only the chain can answer.
 **/
export interface IOpportunitiesOnchainOnly {
  /**
   * What a deposit, withdrawal or leverage change would do, and the calldata
   * that does it.
   *
   * Absent in `offchain` mode: every one of them reads live account and pool
   * state, and the strategy flows additionally need the pathfinder for real swap
   * paths, so there is nothing the backend could answer with.
   **/
  readonly prepare: IOpportunitiesPrepare;
  /**
   * The transaction a prepared operation stands for, see
   * {@link IOpportunitiesExecute.buildTx}. Absent in `offchain` mode for the
   * same reason as {@link prepare}: it encodes against live chain state.
   **/
  readonly execute: IOpportunitiesExecute;
}

/**
 * The chain on its own, for a consumer that shows each source as it arrives.
 * Absent in `offchain` mode.
 **/
export interface IOpportunitiesOnchainBranch {
  readonly onchain: IMultichainOpportunitiesService;
}

/**
 * The backend on its own, see {@link IOpportunitiesOnchainBranch}. Absent in
 * `onchain` mode.
 **/
export interface IOpportunitiesOffchainBranch {
  readonly offchain: IOffchainOpportunities;
}

/**
 * Merge policy of each read, exposed so that a consumer reading the two
 * branches itself combines them exactly as `both` mode would.
 **/
export interface IOpportunityMergers {
  list: ListMerger<Opportunity[]>;
  pool: EntityMerger<PoolOpportunityDetail>;
  strategy: EntityMerger<StrategyOpportunityDetail>;
}

/**
 * Which methods the `opportunities` namespace has in each mode.
 **/
export interface IOpportunitiesByMode {
  onchain: IOpportunitiesBase &
    IOpportunitiesOnchainOnly &
    IOpportunitiesOnchainBranch;
  offchain: IOpportunitiesBase &
    IOpportunitiesOffchainOnly &
    IOpportunitiesOffchainBranch;
  both: IOpportunitiesBase &
    IOpportunitiesOnchainOnly &
    IOpportunitiesOffchainOnly &
    IOpportunitiesOnchainBranch &
    IOpportunitiesOffchainBranch;
}

/**
 * The `opportunities` namespace of a {@link GearboxSDK} in mode `M`.
 **/
export type IOpportunities<M extends Mode = Mode> = IOpportunitiesByMode[M];
