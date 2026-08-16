import type { Address } from "viem";
import type {
  HistorySeries,
  PositionHistoryMetric,
  PositionHistoryQuery,
} from "../../model/history.js";
import type { PositionFilter, PositionList } from "../../model/positions.js";
import { AbstractOffchainNamespace } from "../AbstractOffchainNamespace.js";
import type { GearboxAPIOptions, OffchainResult } from "../types.js";

/**
 * Backend counterpart of the `positions` namespace.
 **/
export class OffchainPositions extends AbstractOffchainNamespace {
  constructor(options?: GearboxAPIOptions) {
    super("OffchainPositions", options);
  }

  /**
   * Everything a wallet holds, optionally narrowed by {@link PositionFilter}.
   *
   * @returns An empty list until the backend client is implemented.
   **/
  public async list(
    wallet: Address,
    filter?: PositionFilter,
  ): Promise<OffchainResult<PositionList>> {
    this.logger?.debug(
      { wallet, filter },
      "offchain positions list is not implemented, serving empty list",
    );
    return { result: { positions: [] }, meta: { status: "success" } };
  }

  /**
   * One historical series of one position. History exists only here: rebuilding
   * it from the chain would mean an archive read per point.
   *
   * The requested metric types the response, so a caller asking for one metric
   * does not have to narrow the union back down. When the transport lands,
   * validation is what upholds it: a response carrying a different metric than
   * the one asked for is a version-skew error like any other.
   *
   * @returns An empty series until the backend client is implemented.
   **/
  public async getHistory<M extends PositionHistoryMetric>(
    query: PositionHistoryQuery<M>,
  ): Promise<OffchainResult<HistorySeries<M>>> {
    this.logger?.debug(
      { query },
      "offchain positions history is not implemented, serving empty series",
    );
    return {
      result: { metric: query.metric, points: [], metadata: {} },
      meta: { status: "success" },
    };
  }
}
