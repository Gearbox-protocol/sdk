import type {
  DataResponse,
  Opportunity,
  OpportunityFilter,
  PoolHistoryMetric,
  PoolOpportunityDetail,
  PoolOpportunityKey,
  PoolOpportunityRef,
  StrategyHistoryMetric,
  StrategyOpportunityDetail,
  StrategyOpportunityKey,
  StrategyOpportunityRef,
} from "../../model/index.js";
import type { OffchainOpportunities } from "../../offchain/index.js";
import type { MultichainOpportunitiesService } from "../../sdk/index.js";
import type { SourceMerger } from "../merge/index.js";
import type { Mode } from "../types.js";
import type { HistoryReader } from "../utils/history.js";

/**
 * Reads every mode supports, because either source alone can answer them.
 **/
export interface OpportunitiesBase {
  /**
   * All pool and strategy opportunities, optionally narrowed.
   *
   * In `both` mode both sources are asked at once and each chain is served by
   * whichever of them is fresh enough, see
   * {@link OpportunityMergers.list}.
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
   * Narrows an already-read list, for a consumer that reads the sources itself.
   *
   * Applies the same conditions the sources would have applied, and drops the
   * chains the filter excludes from the metadata too — the part a consumer
   * cannot do by filtering the rows.
   *
   * `undefined` passes through, so a read still in flight stays that way.
   **/
  filter(
    response: DataResponse<Opportunity[]> | undefined,
    filter?: OpportunityFilter,
  ): DataResponse<Opportunity[]> | undefined;
}

/**
 * Reads only a backend can answer.
 **/
export interface OpportunitiesOffchainOnly {
  /**
   * Historical charts of one opportunity, one metric and one range at a time:
   * `history(key).chart("depositApy", "1m")`.
   *
   * The key's kind decides which metrics exist, so asking a pool for a
   * strategy series does not compile.
   *
   * Absent in `onchain` mode: the chain serves the present, and rebuilding a
   * series from it would mean an archive read per point. There is no second
   * source to fall back to either, so a backend failure is raised rather than
   * reported in the metadata.
   **/
  history(key: PoolOpportunityRef): HistoryReader<PoolHistoryMetric>;
  history(key: StrategyOpportunityRef): HistoryReader<StrategyHistoryMetric>;
}

/**
 * Reads only the chain can answer. Empty for now — every on-chain read the
 * namespace exposes has a backend counterpart.
 **/
// biome-ignore lint/suspicious/noEmptyInterface: reserved slot, see doc comment
export interface OpportunitiesOnchainOnly {}

/**
 * The chain on its own, for a consumer that shows each source as it arrives
 * instead of waiting for the slower one.
 **/
export interface OpportunitiesOnchainBranch {
  /**
   * This namespace on the chain alone. The same instance as
   * `sdk.onchain.opportunities`.
   **/
  readonly onchain: MultichainOpportunitiesService;
}

/**
 * The backend on its own, see {@link OpportunitiesOnchainBranch}.
 **/
export interface OpportunitiesOffchainBranch {
  /**
   * This namespace on the backend alone. The same instance as
   * `sdk.offchain.opportunities`.
   **/
  readonly offchain: OffchainOpportunities;
}

/**
 * Merge policy of each read, exposed so that a consumer reading the two
 * branches itself combines them exactly as `both` mode would.
 **/
export interface OpportunityMergers {
  /**
   * Merges two lists chain by chain: a chain is served by the backend when it
   * is fresh enough, and by the chain otherwise.
   **/
  list: SourceMerger<Opportunity[]>;
  /**
   * Merges two versions of one pool opportunity under the same rule.
   **/
  pool: SourceMerger<PoolOpportunityDetail>;
  /**
   * Merges two versions of one strategy opportunity under the same rule.
   **/
  strategy: SourceMerger<StrategyOpportunityDetail>;
}

/**
 * Merging, which only exists where there are two sources to merge.
 **/
export interface OpportunitiesMerged {
  /**
   * Merge policy per read, see {@link OpportunityMergers}.
   **/
  readonly merge: OpportunityMergers;
}

/**
 * Which methods the `opportunities` namespace has in each mode.
 *
 * A lookup map rather than a conditional type: `both` is spelled out instead of
 * being inferred, and a widened mode degrades to the intersection of what all
 * modes offer rather than silently distributing into a union of everything.
 **/
export interface OpportunitiesByMode {
  onchain: OpportunitiesBase &
    OpportunitiesOnchainOnly &
    OpportunitiesOnchainBranch;
  offchain: OpportunitiesBase &
    OpportunitiesOffchainOnly &
    OpportunitiesOffchainBranch;
  both: OpportunitiesBase &
    OpportunitiesOffchainOnly &
    OpportunitiesOnchainOnly &
    OpportunitiesOnchainBranch &
    OpportunitiesOffchainBranch &
    OpportunitiesMerged;
}

/**
 * The `opportunities` namespace of a {@link GearboxSDK} in mode `M`.
 **/
export type Opportunities<M extends Mode = Mode> = OpportunitiesByMode[M];
