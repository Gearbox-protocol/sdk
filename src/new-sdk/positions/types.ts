import type { Address } from "viem";
import type {
  PoolPositionHistoryMetric,
  PoolPositionRef,
  PositionFilter,
  PositionList,
  StrategyPositionHistoryMetric,
  StrategyPositionRef,
} from "../../model/index.js";
import type { Mode, ReadResult } from "../types.js";
import type { HistoryReader } from "../utils/history.js";

/**
 * Reads every mode supports, because either source alone can answer them.
 **/
export interface PositionsBase {
  /**
   * Everything a wallet holds: its pool shares, its credit accounts and the
   * delayed withdrawals it took over by liquidating, optionally narrowed,
   * together with the backend's aggregate summary when available.
   *
   * In `both` mode the two lists are unioned by canonical position id and
   * merged field-wise, with the chain winning any field both sources fill.
   **/
  list(
    wallet: Address,
    filter?: PositionFilter,
  ): Promise<ReadResult<PositionList>>;
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
   * series from it would mean an archive read per point.
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
 * Which methods the `positions` namespace has in each mode.
 *
 * A lookup map rather than a conditional type: `both` is spelled out instead of
 * being inferred, and a widened mode degrades to the intersection of what all
 * modes offer rather than silently distributing into a union of everything.
 **/
export interface PositionsByMode {
  onchain: PositionsBase & PositionsOnchainOnly;
  offchain: PositionsBase & PositionsOffchainOnly;
  both: PositionsBase & PositionsOffchainOnly & PositionsOnchainOnly;
}

/**
 * The `positions` namespace of a {@link GearboxSDK} in mode `M`.
 **/
export type Positions<M extends Mode = Mode> = PositionsByMode[M];
