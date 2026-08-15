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
import type { SourceMerger } from "../merge/index.js";
import type { Mode } from "../types.js";
import type { HistoryReader } from "../utils/history.js";

/**
 * Reads every mode supports, because either source alone can answer them.
 **/
export interface PositionsBase {
  /**
   * Everything a wallet holds: its pool shares, its credit accounts and the
   * delayed withdrawals it took over by liquidating, optionally narrowed.
   *
   * In `both` mode both sources are asked at once and each chain is served by
   * whichever of them is fresh enough, see {@link PositionMergers.list}.
   **/
  list(
    wallet: Address,
    filter?: PositionFilter,
  ): Promise<DataResponse<Position[]>>;
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
    response: DataResponse<Position[]> | undefined,
    filter?: PositionFilter,
  ): DataResponse<Position[]> | undefined;
}

/**
 * Reads only a backend can answer.
 **/
export interface PositionsOffchainOnly {
  /**
   * Historical charts of one position, one metric and one range at a time:
   * `history(key).chart("netApy", "1m")`.
   *
   * The key's kind decides which metrics exist, so asking a pool position for a
   * strategy series does not compile. Liquidation positions have no history at
   * all: a delayed withdrawal is a single event rather than a series, which is
   * why no key names one.
   *
   * Absent in `onchain` mode: the chain serves the present, and rebuilding a
   * series from it would mean an archive read per point. There is no second
   * source to fall back to either, so a backend failure is raised rather than
   * reported in the metadata.
   **/
  history(key: PoolPositionRef): HistoryReader<PoolPositionHistoryMetric>;
  history(
    key: StrategyPositionRef,
  ): HistoryReader<StrategyPositionHistoryMetric>;
}

/**
 * Reads only the chain can answer. Empty for now — every on-chain read the
 * namespace exposes has a backend counterpart.
 **/
// biome-ignore lint/suspicious/noEmptyInterface: reserved slot, see doc comment
export interface PositionsOnchainOnly {}

/**
 * The chain on its own, for a consumer that shows each source as it arrives
 * instead of waiting for the slower one.
 **/
export interface PositionsOnchainBranch {
  /**
   * This namespace on the chain alone. The same instance as
   * `sdk.onchain.positions`.
   **/
  readonly onchain: MultichainPositionsService;
}

/**
 * The backend on its own, see {@link PositionsOnchainBranch}.
 **/
export interface PositionsOffchainBranch {
  /**
   * This namespace on the backend alone. The same instance as
   * `sdk.offchain.positions`.
   **/
  readonly offchain: OffchainPositions;
}

/**
 * Merge policy of each read, exposed so that a consumer reading the two
 * branches itself combines them exactly as `both` mode would.
 **/
export interface PositionMergers {
  /**
   * Merges two lists chain by chain: a chain is served by the backend when it
   * is fresh enough, and by the chain otherwise.
   **/
  list: SourceMerger<Position[]>;
}

/**
 * Merging, which only exists where there are two sources to merge.
 **/
export interface PositionsMerged {
  /**
   * Merge policy per read, see {@link PositionMergers}.
   **/
  readonly merge: PositionMergers;
}

/**
 * Which methods the `positions` namespace has in each mode.
 *
 * A lookup map rather than a conditional type: `both` is spelled out instead of
 * being inferred, and a widened mode degrades to the intersection of what all
 * modes offer rather than silently distributing into a union of everything.
 **/
export interface PositionsByMode {
  onchain: PositionsBase & PositionsOnchainOnly & PositionsOnchainBranch;
  offchain: PositionsBase & PositionsOffchainOnly & PositionsOffchainBranch;
  both: PositionsBase &
    PositionsOffchainOnly &
    PositionsOnchainOnly &
    PositionsOnchainBranch &
    PositionsOffchainBranch &
    PositionsMerged;
}

/**
 * The `positions` namespace of a {@link GearboxSDK} in mode `M`.
 **/
export type Positions<M extends Mode = Mode> = PositionsByMode[M];
