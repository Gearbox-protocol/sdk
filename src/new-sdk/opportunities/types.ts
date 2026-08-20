import type {
  ChartBundle,
  ChartRange,
  DataResponse,
  Opportunity,
  OpportunityFilter,
  PoolOpportunityChartMetric,
  PoolOpportunityDetail,
  PoolOpportunityKey,
  PoolOpportunityRef,
  StrategyOpportunityChartMetric,
  StrategyOpportunityDetail,
  StrategyOpportunityKey,
  StrategyOpportunityRef,
} from "../../model/index.js";
import type { OffchainOpportunities } from "../../offchain/index.js";
import type { MultichainOpportunitiesService } from "../../sdk/index.js";
import type { OpportunitiesExecute } from "../execute/index.js";
import type { OpportunitiesPrepare } from "../prepare/index.js";
import type { Mode } from "../types.js";
import type { EntityMerger, FilterResult, ListMerger } from "../utils/index.js";

/**
 * What the `opportunities` namespace offers in every mode.
 **/
export interface OpportunitiesBase {
  /**
   * All pool and strategy opportunities, optionally narrowed. In `both` mode
   * each chain is served by whichever source is fresh enough, see
   * {@link OpportunityMergers}.
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
   * The chain on its own, for a consumer that shows each source as it arrives.
   * Throws in `offchain` mode.
   **/
  readonly onchain: MultichainOpportunitiesService;
  /**
   * The backend on its own, see {@link OpportunitiesBase.onchain}. Throws in
   * `onchain` mode.
   **/
  readonly offchain: OffchainOpportunities;
  /**
   * Merge policy of each read, for a consumer combining the two branches
   * itself, see {@link OpportunityMergers}.
   **/
  readonly merge: OpportunityMergers;
}

/**
 * Reads only a backend can answer.
 **/
export interface OpportunitiesOffchainOnly {
  /**
   * Historical charts of one opportunity, one series per metric on a shared
   * axis: `charts(key, ["depositApy", "borrowApy"], "1m")`.
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
export interface OpportunitiesOnchainOnly {
  /**
   * Simulations of what a deposit, withdrawal or leverage change would do.
   *
   * Absent in `offchain` mode: every one of them reads live account and pool
   * state, and the strategy flows additionally need the pathfinder for real swap
   * paths, so there is nothing the backend could answer with.
   **/
  readonly prepare: OpportunitiesPrepare;
  /**
   * The transaction a prepared operation stands for, see
   * {@link OpportunitiesExecute.buildTx}. Absent in `offchain` mode for the
   * same reason as {@link prepare}: it encodes against live chain state.
   **/
  readonly execute: OpportunitiesExecute;
}

/**
 * Which reads the `opportunities` namespace has in each mode. A widened mode
 * offers what every mode has, i.e. {@link OpportunitiesBase} alone.
 **/
export interface OpportunitiesOnchainBranch {
  readonly onchain: MultichainOpportunitiesService;
}

/**
 * The backend on its own, see {@link OpportunitiesOnchainBranch}.
 **/
export interface OpportunitiesOffchainBranch {
  readonly offchain: OffchainOpportunities;
}

/**
 * Merge policy of each read, exposed so that a consumer reading the two
 * branches itself combines them exactly as `both` mode would: a chain is served
 * by the backend when it is fresh enough, and by the chain otherwise.
 **/
export interface OpportunityMergers {
  list: ListMerger<Opportunity[]>;
  pool: EntityMerger<PoolOpportunityDetail>;
  strategy: EntityMerger<StrategyOpportunityDetail>;
}

/**
 * Merging, which only exists where there are two sources to merge.
 **/
export interface OpportunitiesMerged {
  readonly merge: OpportunityMergers;
}

/**
 * Which methods the `opportunities` namespace has in each mode.
 **/
export interface OpportunitiesByMode {
  onchain: OpportunitiesBase &
    OpportunitiesOnchainOnly &
    OpportunitiesOnchainBranch;
  offchain: OpportunitiesBase &
    OpportunitiesOffchainOnly &
    OpportunitiesOffchainBranch;
  both: OpportunitiesBase &
    OpportunitiesOnchainOnly &
    OpportunitiesOffchainOnly;
}

/**
 * The `opportunities` namespace of a {@link GearboxSDK} in mode `M`.
 **/
export type Opportunities<M extends Mode = Mode> = OpportunitiesByMode[M];
