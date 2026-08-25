import type { Address } from "viem";
import type {
  ChartBundle,
  ChartRange,
  DataResponse,
  PoolPositionChartMetric,
  PoolPositionRef,
  Position,
  PositionFilter,
  StrategyPositionChartMetric,
  StrategyPositionRef,
} from "../../model/index.js";
import type { OffchainPositions } from "../../offchain/index.js";
import type { MultichainPositionsService } from "../../onchain/index.js";
import type { Mode } from "../types.js";
import type { FilterResult, ListMerger } from "../utils/index.js";

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
   * through, so a read still in flight stays that way, and a list already read
   * narrows to a list.
   **/
  filter<R extends DataResponse<Position[]> | undefined>(
    response: R,
    filter?: PositionFilter,
  ): FilterResult<R, Position>;
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
   * Historical charts of one position, one series per metric on a shared axis:
   * `charts(key, ["apy", "mwr"], "1m")`.
   *
   * The key's kind decides which metrics exist, so asking a pool position for a
   * strategy chart does not compile. Liquidation positions have no charts: a
   * delayed withdrawal is a single event rather than a series.
   **/
  charts<const Metrics extends readonly PoolPositionChartMetric[]>(
    key: PoolPositionRef,
    metrics: Metrics,
    range: ChartRange,
  ): Promise<DataResponse<ChartBundle<Metrics>>>;
  charts<const Metrics extends readonly StrategyPositionChartMetric[]>(
    key: StrategyPositionRef,
    metrics: Metrics,
    range: ChartRange,
  ): Promise<DataResponse<ChartBundle<Metrics>>>;
}

/**
 * Reads only the chain can answer. Empty for now.
 **/
// biome-ignore lint/suspicious/noEmptyInterface: reserved slot, see doc comment
export interface PositionsOnchainOnly {}

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
 * branches itself combines them exactly as `both` mode would.
 **/
export interface PositionMergers {
  list: ListMerger<Position[]>;
}

/**
 * Which methods the `positions` namespace has in each mode.
 **/
export interface PositionsByMode {
  onchain: PositionsBase & PositionsOnchainOnly;
  offchain: PositionsBase & PositionsOffchainOnly;
  both: PositionsBase & PositionsOnchainOnly & PositionsOffchainOnly;
}

/**
 * The `positions` namespace of a {@link GearboxSDK} in mode `M`.
 **/
export type Positions<M extends Mode = Mode> = PositionsByMode[M];
