import type { Address } from "viem";
import type {
  DataResponse,
  HistoryRange,
  PoolPositionHistoryMetric,
  PoolPositionRef,
  Position,
  PositionFilter,
  PositionKey,
  StrategyPositionHistoryMetric,
  StrategyPositionRef,
} from "../../model/index.js";
import { matchesPositionFilter } from "../../model/index.js";
import type { GearboxAPI } from "../../offchain/index.js";
import type { MultichainSDK } from "../../sdk/index.js";
import { AbstractNamespace } from "../AbstractNamespace.js";
import { mergeChainList } from "../merge/index.js";
import type { NamespaceOptions } from "../types.js";
import type { HistoryReader } from "../utils/index.js";
import { filterResponse } from "../utils/index.js";
import type {
  PositionMergers,
  PositionsBase,
  PositionsMerged,
  PositionsOffchainOnly,
} from "./types.js";

/**
 * The `positions` namespace of the combined SDK.
 *
 * A stateless router over the two sources, see {@link AbstractNamespace} for the
 * routing itself. What is specific to positions is the reads below and the
 * mergers they name.
 *
 * The class implements the methods of every mode; {@link GearboxSDK} exposes it
 * as its mode's slice of {@link PositionsByMode}, so calling a method the mode
 * does not have is a compile error rather than a runtime one.
 **/
export class PositionsNamespace
  extends AbstractNamespace<MultichainSDK["positions"], GearboxAPI["positions"]>
  implements PositionsBase, PositionsOffchainOnly, PositionsMerged
{
  /**
   * {@inheritDoc PositionsMerged.merge}
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
      scope: filter?.chainIds,
      fromChain: source => source.list({ wallet, filter }),
      fromBackend: source => source.list({ wallet, filter }),
      merge: this.merge.list,
    });
  }

  /**
   * {@inheritDoc PositionsBase.filter}
   **/
  public filter(
    response: DataResponse<Position[]> | undefined,
    filter?: PositionFilter,
  ): DataResponse<Position[]> | undefined {
    return filterResponse(response, filter, matchesPositionFilter);
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
