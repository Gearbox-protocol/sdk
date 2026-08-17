import type { Address } from "viem";
import { z } from "zod/v4";
import type {
  HistorySeries,
  PositionHistoryMetric,
  PositionHistoryQuery,
} from "../../model/history.js";
import type {
  Position,
  PositionKey,
  PositionsTotals,
  PositionTransaction,
} from "../../model/positions.js";
import {
  positionFilterQuerySchema,
  positionSchema,
  positionsTotalsSchema,
  positionTransactionSchema,
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
   * Aggregate over everything the wallet holds on the covered chains, see
   * {@link PositionsTotals}. Served by the backend, never summed here.
   **/
  public async totals(wallet: Address): Promise<DataResponse<PositionsTotals>> {
    return this.get({
      path: `${this.#root}/${wallet}/totals`,
      query: { chainIds: this.scopedChainIds().join(",") },
      schema: positionsTotalsSchema,
    });
  }

  /**
   * The transactions that made one position what it is, newest first, from
   * the backend's indexer.
   **/
  public async transactions(
    key: PositionKey,
  ): Promise<DataResponse<PositionTransaction[]>> {
    // a pool position exists only relative to its holder; an account is its
    // own identity
    const path =
      key.kind === "pool"
        ? `${this.#root}/pool/${key.chainId}/${key.pool}/${key.wallet}/transactions`
        : `${this.#root}/strategy/${key.chainId}/${key.creditAccount}/transactions`;
    return this.get({ path, schema: z.array(positionTransactionSchema) });
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
