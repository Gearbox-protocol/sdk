import { z } from "zod/v4";
import type {
  HistorySeries,
  PositionHistoryMetric,
  PositionHistoryQuery,
} from "../../model/history.js";
import type { Position } from "../../model/positions.js";
import {
  positionFilterQuerySchema,
  positionSchema,
} from "../../model/positions.schema.js";
import type { DataResponse } from "../../model/response.js";
import type { ListPositionsPropsBase } from "../../sdk/positions/types.js";
import { AbstractOffchainNamespace } from "../AbstractOffchainNamespace.js";
import type { GearboxAPIOptions } from "../types.js";

/**
 * Backend counterpart of the `positions` namespace.
 **/
export class OffchainPositions extends AbstractOffchainNamespace {
  readonly #root = "/v2/positions";

  constructor(options: GearboxAPIOptions) {
    super("OffchainPositions", options);
  }

  /**
   * Everything a wallet holds, optionally narrowed by {@link PositionFilter}.
   **/
  public async list(
    props: ListPositionsPropsBase,
  ): Promise<DataResponse<Position[]>> {
    // the chains are always named, even when the filter does not: the backend
    // serves chains this client has no business showing
    return this.get({
      path: `${this.#root}/${props.wallet}`,
      // the encode direction of the same codec the backend validates with
      query: z.encode(positionFilterQuerySchema, {
        ...props.filter,
        chainIds: this.scopedChainIds(props.filter),
      }),
      schema: z.array(positionSchema),
    });
  }

  /**
   * One historical series of one position.
   *
   * @returns An empty series until the backend client is implemented.
   **/
  public async getHistory<M extends PositionHistoryMetric>(
    query: PositionHistoryQuery<M>,
  ): Promise<DataResponse<HistorySeries<M>>> {
    return {
      data: { metric: query.metric, points: [], metadata: {} },
      meta: { chains: [] },
    };
  }
}
