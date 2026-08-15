import type {
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
import type { OpportunitiesSimulate } from "../simulate/index.js";
import type { Mode, ReadResult } from "../types.js";
import type { HistoryReader } from "../utils/history.js";

/**
 * Reads every mode supports, because either source alone can answer them.
 **/
export interface OpportunitiesBase {
  /**
   * All pool and strategy opportunities, optionally narrowed.
   *
   * In `both` mode the two lists are unioned by canonical opportunity id and
   * merged field-wise, with the chain winning any field both sources fill.
   **/
  list(filter?: OpportunityFilter): Promise<ReadResult<Opportunity[]>>;
  /**
   * Detailed view of one pool opportunity.
   **/
  getPool(key: PoolOpportunityKey): Promise<ReadResult<PoolOpportunityDetail>>;
  /**
   * Detailed view of one strategy opportunity.
   **/
  getStrategy(
    key: StrategyOpportunityKey,
  ): Promise<ReadResult<StrategyOpportunityDetail>>;
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
   * series from it would mean an archive read per point.
   **/
  history(key: PoolOpportunityRef): HistoryReader<PoolHistoryMetric>;
  history(key: StrategyOpportunityRef): HistoryReader<StrategyHistoryMetric>;
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
  simulate: OpportunitiesSimulate;
}

/**
 * Which methods the `opportunities` namespace has in each mode.
 *
 * A lookup map rather than a conditional type: `both` is spelled out instead of
 * being inferred, and a widened mode degrades to the intersection of what all
 * modes offer rather than silently distributing into a union of everything.
 **/
export interface OpportunitiesByMode {
  onchain: OpportunitiesBase & OpportunitiesOnchainOnly;
  offchain: OpportunitiesBase & OpportunitiesOffchainOnly;
  both: OpportunitiesBase &
    OpportunitiesOffchainOnly &
    OpportunitiesOnchainOnly;
}

/**
 * The `opportunities` namespace of a {@link GearboxSDK} in mode `M`.
 **/
export type Opportunities<M extends Mode = Mode> = OpportunitiesByMode[M];
