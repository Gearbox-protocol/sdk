import type { Address } from "viem";
import type {
  DataResponse,
  HistoryRange,
  PoolPositionHistoryMetric,
  PoolPositionRef,
  Position,
  PositionFilter,
  PositionKey,
  PositionsTotals,
  PositionTransaction,
  StrategyPositionHistoryMetric,
  StrategyPositionRef,
} from "../../model/index.js";
import { matchesPositionFilter } from "../../model/index.js";
import type { GearboxAPI } from "../../offchain/index.js";
import type { MultichainSDK } from "../../sdk/index.js";
import { AbstractNamespace } from "../AbstractNamespace.js";
import type { NamespaceOptions } from "../types.js";
import type { FilterResult, HistoryReader } from "../utils/index.js";
import { filterResponse, mergeChainList } from "../utils/index.js";
import type {
  PositionMergers,
  PositionsBase,
  PositionsOffchainOnly,
} from "./types.js";

/**
 * The `positions` namespace of a {@link GearboxSDK}, see
 * {@link PositionsByMode} for what each mode offers.
 **/
export class PositionsNamespace
  extends AbstractNamespace<MultichainSDK["positions"], GearboxAPI["positions"]>
  implements PositionsBase, PositionsOffchainOnly
{
  /**
   * {@inheritDoc PositionsBase.merge}
   **/
  public readonly merge: PositionMergers = {
    list: (onchain, offchain) =>
      mergeChainList(onchain, offchain, this.maxOffchainLagSeconds),
  };

  constructor(
    onchain: MultichainSDK | undefined,
    offchain: GearboxAPI | undefined,
    options: NamespaceOptions,
  ) {
    super("Positions", onchain?.positions, offchain?.positions, options);
  }

  /**
   * {@inheritDoc PositionsBase.list}
   **/
  public async list(
    wallet: Address,
    filter?: PositionFilter,
  ): Promise<DataResponse<Position[]>> {
    // the filter goes to both sources as it was given: each one scopes the
    // request to the chains it covers itself
    return this.merged("list positions", {
      chainIds: filter?.chainIds,
      fromChain: source => source.list({ wallet, filter }),
      fromBackend: source => source.list({ wallet, filter }),
      merge: this.merge.list,
    });
  }

  /**
   * {@inheritDoc PositionsBase.filter}
   **/
  public filter<R extends DataResponse<Position[]> | undefined>(
    response: R,
    filter?: PositionFilter,
  ): FilterResult<R, Position> {
    return filterResponse(response, filter, matchesPositionFilter);
  }

  /**
   * {@inheritDoc PositionsOffchainOnly.totals}
   **/
  public async totals(wallet: Address): Promise<DataResponse<PositionsTotals>> {
    return this.offchain.totals(wallet);
  }

  /**
   * {@inheritDoc PositionsOffchainOnly.transactions}
   **/
  public async transactions(
    key: PositionKey,
  ): Promise<DataResponse<PositionTransaction[]>> {
    return this.offchain.transactions(key);
  }

  /**
   * {@inheritDoc PositionsOffchainOnly.history}
   **/
  public history(
    key: PoolPositionRef,
  ): HistoryReader<PoolPositionHistoryMetric>;
  public history(
    key: StrategyPositionRef,
  ): HistoryReader<StrategyPositionHistoryMetric>;
  public history(
    key: PositionKey,
  ):
    | HistoryReader<PoolPositionHistoryMetric>
    | HistoryReader<StrategyPositionHistoryMetric> {
    // nothing is fetched here: the reader is a view over the backend read, so
    // each chart is requested on its own, when it is asked for
    return {
      chart: (metric: PoolPositionHistoryMetric, range: HistoryRange) =>
        this.offchain.getHistory({ position: key, range, metric }),
    };
  }
}
