import type { Address } from "viem";
import type {
  ChartBundle,
  ChartRange,
  DataResponse,
  PoolPositionChartMetric,
  PoolPositionRef,
  Position,
  PositionFilter,
  PositionsTotals,
  PositionTransaction,
  PositionWithdrawals,
  StrategyPositionChartMetric,
  StrategyPositionRef,
} from "../../model/index.js";
import type { IOffchainPositions } from "../../offchain/index.js";
import type {
  GetCurrentWithdrawalsProps,
  IMultichainPositionsService,
} from "../../onchain/index.js";
import type { Mode } from "../types.js";
import type { FilterResult, ListMerger } from "../utils/index.js";

/**
 * What the `positions` namespace offers in every mode.
 **/
export interface IPositionsBase {
  /**
   * Everything a wallet holds: its pool shares, its credit accounts and the
   * delayed withdrawals it took over by liquidating, optionally narrowed. In
   * `both` mode each chain is served by whichever source is fresh enough, see
   * {@link IPositionMergers}.
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
   * Merge policy of each read, for a consumer combining the two branches
   * itself, see {@link IPositionMergers}.
   **/
  readonly merge: IPositionMergers;
}

/**
 * Reads only a backend can answer.
 **/
export interface IPositionsOffchainOnly {
  /**
   * Aggregate over everything a wallet holds: the list screen's badges, see
   * {@link PositionsTotals}.
   *
   * Absent in `onchain` mode: it is served by the backend rather than summed
   * from the chain.
   **/
  totals(wallet: Address): Promise<DataResponse<PositionsTotals>>;
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
  /**
   * History of one strategy position: every transaction that touched the
   * credit account while its current session was open, newest first. There is
   * no paging, and an account with no open session answers with an empty list.
   *
   * Absent in `onchain` mode: the history is indexed by the backend rather
   * than reconstructed from the chain.
   **/
  transactions(
    key: StrategyPositionRef,
  ): Promise<DataResponse<PositionTransaction[]>>;
}

/**
 * Reads only the chain can answer.
 **/
export interface IPositionsOnchainOnly {
  /**
   * Delayed withdrawals of one credit account: claimable rows carry the
   * adapter call and recorded intent a claim is built from; pending rows
   * name when they mature. Absent in `offchain` mode.
   **/
  getCurrentWithdrawals(
    props: GetCurrentWithdrawalsProps<true>,
  ): Promise<DataResponse<PositionWithdrawals>>;
}

/**
 * The chain on its own, for a consumer that shows each source as it arrives.
 * Absent in `offchain` mode.
 **/
export interface IPositionsOnchainBranch {
  readonly onchain: IMultichainPositionsService;
}

/**
 * The backend on its own, see {@link IPositionsOnchainBranch}. Absent in
 * `onchain` mode.
 **/
export interface IPositionsOffchainBranch {
  readonly offchain: IOffchainPositions;
}

/**
 * Merge policy of each read, exposed so that a consumer reading the two
 * branches itself combines them exactly as `both` mode would.
 **/
export interface IPositionMergers {
  list: ListMerger<Position[]>;
}

/**
 * Which methods the `positions` namespace has in each mode.
 **/
export interface IPositionsByMode {
  onchain: IPositionsBase & IPositionsOnchainOnly & IPositionsOnchainBranch;
  offchain: IPositionsBase & IPositionsOffchainOnly & IPositionsOffchainBranch;
  both: IPositionsBase &
    IPositionsOnchainOnly &
    IPositionsOffchainOnly &
    IPositionsOnchainBranch &
    IPositionsOffchainBranch;
}

/**
 * The `positions` namespace of a {@link GearboxSDK} in mode `M`.
 **/
export type IPositions<M extends Mode = Mode> = IPositionsByMode[M];
