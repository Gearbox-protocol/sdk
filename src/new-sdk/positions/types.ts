import type { Address } from "viem";
import type {
  DataResponse,
  PoolPositionHistoryMetric,
  PoolPositionRef,
  Position,
  PositionFilter,
  StrategyPositionHistoryMetric,
  StrategyPositionRef,
} from "../../model/index.js";
import type { OffchainPositions } from "../../offchain/index.js";
import type { MultichainPositionsService } from "../../sdk/index.js";
import type { Mode } from "../types.js";
import type { HistoryReader } from "../utils/history.js";
import type { SourceMerger } from "../utils/index.js";

/**
 * What the `positions` namespace offers in every mode.
 **/
export interface PositionsBase {
  /**
   * Everything a wallet holds: its pool shares, its credit accounts and the
   * delayed withdrawals it took over by liquidating, optionally narrowed. In
   * `both` mode each chain is served by whichever source is fresh enough, see
   * {@link PositionMergers}.
   **/
  list(
    wallet: Address,
    filter?: PositionFilter,
  ): Promise<DataResponse<Position[]>>;
  /**
   * Narrows an already-read list, rows and metadata alike. `undefined` passes
   * through, so a read still in flight stays that way.
   **/
  filter(
    response: DataResponse<Position[]> | undefined,
    filter?: PositionFilter,
  ): DataResponse<Position[]> | undefined;
  /**
   * The chain on its own, for a consumer that shows each source as it arrives.
   * Throws in `offchain` mode.
   **/
  readonly onchain: MultichainPositionsService;
  /**
   * The backend on its own, see {@link PositionsBase.onchain}. Throws in
   * `onchain` mode.
   **/
  readonly offchain: OffchainPositions;
  /**
   * Merge policy of each read, for a consumer combining the two branches
   * itself, see {@link PositionMergers}.
   **/
  readonly merge: PositionMergers;
}

/**
 * Reads only a backend can answer.
 **/
export interface PositionsOffchainOnly {
  /**
   * Historical charts of one position, one metric and one range at a time:
   * `history(key).chart("netApy", "1m")`. The key's kind decides which metrics
   * exist, so asking a pool position for a strategy series does not compile.
   * Liquidation positions have no charts: a delayed withdrawal is a single
   * event rather than a series.
   **/
  // no key names a liquidation position: a delayed withdrawal is a single event
  // rather than a series. There is no second source to fall back to either, so a
  // backend failure is raised rather than reported in the metadata
  history(key: PoolPositionRef): HistoryReader<PoolPositionHistoryMetric>;
  history(
    key: StrategyPositionRef,
  ): HistoryReader<StrategyPositionHistoryMetric>;
}

/**
 * Reads only the chain can answer. Empty for now.
 **/
// biome-ignore lint/suspicious/noEmptyInterface: reserved slot, see doc comment
export interface PositionsOnchainOnly {}

/**
 * How each read combines what the two sources returned: a chain is served by
 * the backend when it is fresh enough, and by the chain otherwise.
 **/
export interface PositionMergers {
  list: SourceMerger<Position[]>;
}

/**
 * Which reads the `positions` namespace has in each mode. A widened mode offers
 * what every mode has, i.e. {@link PositionsBase} alone.
 **/
export interface PositionsOnchainBranch {
  readonly onchain: MultichainPositionsService;
}

/**
 * The backend on its own, see {@link PositionsOnchainBranch}.
 **/
export interface PositionsOffchainBranch {
  readonly offchain: OffchainPositions;
}

/**
 * Merge policy of each read, exposed so that a consumer reading the two
 * branches itself combines them exactly as `both` mode would: a chain is served
 * by the backend when it is fresh enough, and by the chain otherwise.
 **/
export interface PositionMergers {
  list: SourceMerger<Position[]>;
}

/**
 * Merging, which only exists where there are two sources to merge.
 **/
export interface PositionsMerged {
  readonly merge: PositionMergers;
}

/**
 * Which methods the `positions` namespace has in each mode.
 **/
// a lookup map rather than a conditional type: `both` is spelled out instead of
// being inferred, and a widened mode degrades to the intersection of what all
// modes offer rather than silently distributing into a union of everything
export interface PositionsByMode {
  onchain: PositionsBase & PositionsOnchainOnly;
  offchain: PositionsBase & PositionsOffchainOnly;
  both: PositionsBase & PositionsOnchainOnly & PositionsOffchainOnly;
}

/**
 * The `positions` namespace of a {@link GearboxSDK} in mode `M`.
 **/
export type Positions<M extends Mode = Mode> = PositionsByMode[M];
