import type {
  HistorySeries,
  PositionHistoryMetric,
  PositionHistoryQuery,
} from "../../model/history.js";
import type { Position } from "../../model/positions.js";
import type { DataResponse } from "../../model/response.js";
import type { ListPositionsPropsBase } from "../../sdk/positions/types.js";
import { AbstractOffchainNamespace } from "../AbstractOffchainNamespace.js";
import type { GearboxAPIOptions } from "../types.js";

/**
 * Backend counterpart of the `positions` namespace.
 **/
export class OffchainPositions extends AbstractOffchainNamespace {
  constructor(options: GearboxAPIOptions) {
    super("OffchainPositions", options);
  }

  /**
   * Everything a wallet holds, optionally narrowed by {@link PositionFilter}.
   *
   * Takes the same props as the chain's own list so that both branches of a
   * combined read are called identically. There is no `blockNumber` among them:
   * the backend serves what it has indexed, and inventing a query parameter for
   * a historical read it cannot do would be a lie.
   *
   * @returns An empty list until the backend client is implemented.
   **/
  public async list(
    props: ListPositionsPropsBase,
  ): Promise<DataResponse<Position[]>> {
    this.logger?.debug(
      { ...props, chainIds: this.scopedChainIds(props.filter) },
      "offchain positions list is not implemented, serving empty list",
    );
    return { data: [], meta: { chains: [] } };
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
  ): Promise<DataResponse<HistorySeries<M>>> {
    this.logger?.debug(
      { query },
      "offchain positions history is not implemented, serving empty series",
    );
    return {
      data: { metric: query.metric, points: [], metadata: {} },
      meta: { chains: [] },
    };
  }
}
