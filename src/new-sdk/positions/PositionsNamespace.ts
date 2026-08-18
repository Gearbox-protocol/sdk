import type { Address } from "viem";
import type {
  ChartBundle,
  ChartRange,
  DataResponse,
  PoolPositionChartMetric,
  PoolPositionRef,
  Position,
  PositionChartMetric,
  PositionFilter,
  PositionKey,
  StrategyPositionChartMetric,
  StrategyPositionRef,
} from "../../model/index.js";
import { matchesPositionFilter } from "../../model/index.js";
import type { GearboxAPI } from "../../offchain/index.js";
import type { MultichainSDK } from "../../sdk/index.js";
import { AbstractNamespace } from "../AbstractNamespace.js";
import type { NamespaceOptions } from "../types.js";
import type { FilterResult } from "../utils/index.js";
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
   * {@inheritDoc PositionsOffchainOnly.charts}
   **/
  public charts<const Metrics extends readonly PoolPositionChartMetric[]>(
    key: PoolPositionRef,
    metrics: Metrics,
    range: ChartRange,
  ): Promise<DataResponse<ChartBundle<Metrics>>>;
  public charts<const Metrics extends readonly StrategyPositionChartMetric[]>(
    key: StrategyPositionRef,
    metrics: Metrics,
    range: ChartRange,
  ): Promise<DataResponse<ChartBundle<Metrics>>>;
  public async charts<const Metrics extends readonly PositionChartMetric[]>(
    key: PositionKey,
    metrics: Metrics,
    range: ChartRange,
  ): Promise<DataResponse<ChartBundle<Metrics>>> {
    return this.offchain.getCharts(key, metrics, range);
  }
}
