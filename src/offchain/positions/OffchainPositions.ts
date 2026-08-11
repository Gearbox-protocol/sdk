import type { Address } from "viem";
import type {
  HistorySeries,
  PositionHistoryMetric,
  PositionHistoryQuery,
} from "../../model/history.js";
import type { Position, PositionFilter } from "../../model/positions.js";
import type { ILogger } from "../../sdk/types/logger.js";
import type { GearboxAPIOptions, OffchainResult } from "../types.js";

/**
 * Backend counterpart of the `positions` namespace.
 *
 * This is a stub: the HTTP client is not written yet, so reads answer with an
 * empty payload. Every signature is already the final one, because the backend
 * returns the read model types directly — there is no wire DTO and no mapper
 * between the two.
 *
 * When the transport lands, each method will validate the response against the
 * matching schema from `src/model` before returning it. A validation failure is
 * a version-skew error and is handled exactly like a transport error: the
 * combined SDK drops the backend's contribution in `both` mode and rethrows in
 * `offchain` mode.
 **/
export class OffchainPositions {
  readonly #baseUrl?: string;
  readonly #logger?: ILogger;

  constructor(options?: GearboxAPIOptions) {
    this.#baseUrl = options?.baseUrl;
    this.#logger = options?.logger?.child?.({ name: "OffchainPositions" });
  }

  /**
   * Base URL the client will call once the transport is implemented.
   **/
  public get baseUrl(): string | undefined {
    return this.#baseUrl;
  }

  /**
   * Everything a wallet holds, optionally narrowed by {@link PositionFilter}.
   *
   * @returns An empty list until the backend client is implemented.
   **/
  public async list(
    wallet: Address,
    filter?: PositionFilter,
  ): Promise<OffchainResult<Position[]>> {
    this.#logger?.debug(
      { wallet, filter },
      "offchain positions list is not implemented, serving empty list",
    );
    return { result: [], meta: { status: "success" } };
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
    this.#logger?.debug(
      { query },
      "offchain positions history is not implemented, serving empty series",
    );
    return {
      result: { metric: query.metric, points: [], metadata: {} },
      meta: { status: "success" },
    };
  }
}
