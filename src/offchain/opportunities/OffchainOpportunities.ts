import type { HistoryQuery, HistorySeries } from "../../model/history.js";
import type {
  Opportunity,
  OpportunityFilter,
  PoolOpportunityDetail,
  PoolOpportunityKey,
  StrategyOpportunityDetail,
  StrategyOpportunityKey,
} from "../../model/opportunities.js";
import type { ILogger } from "../../sdk/types/logger.js";
import type { GearboxAPIOptions, OffchainResult } from "../types.js";

/**
 * Thrown by the endpoints that have no stub answer, so that a caller in
 * `offchain` mode fails loudly instead of reading an empty detail page as a
 * missing opportunity.
 **/
export class OffchainNotImplementedError extends Error {
  constructor(endpoint: string) {
    super(`GearboxAPI: ${endpoint} is not implemented yet`);
    this.name = "OffchainNotImplementedError";
  }
}

/**
 * Backend counterpart of the `opportunities` namespace.
 *
 * This is a stub: the HTTP client is not written yet, so list reads answer with
 * an empty list and detail reads throw. Every signature is already the final
 * one, because the backend returns the read model types directly — there is no
 * wire DTO and no mapper between the two.
 *
 * When the transport lands, each method will validate the response against the
 * matching schema from `src/model` before returning it. A validation failure is
 * a version-skew error and is handled exactly like a transport error: the
 * combined SDK drops the backend's contribution in `both` mode and rethrows in
 * `offchain` mode.
 **/
export class OffchainOpportunities {
  readonly #baseUrl?: string;
  readonly #logger?: ILogger;

  constructor(options?: GearboxAPIOptions) {
    this.#baseUrl = options?.baseUrl;
    this.#logger = options?.logger?.child?.({ name: "OffchainOpportunities" });
  }

  /**
   * Base URL the client will call once the transport is implemented.
   **/
  public get baseUrl(): string | undefined {
    return this.#baseUrl;
  }

  /**
   * All opportunities the backend knows about, optionally narrowed by
   * {@link OpportunityFilter}.
   *
   * @returns An empty list until the backend client is implemented.
   **/
  public async list(
    filter?: OpportunityFilter,
  ): Promise<OffchainResult<Opportunity[]>> {
    this.#logger?.debug(
      { filter },
      "offchain opportunities list is not implemented, serving empty list",
    );
    return { result: [], meta: { status: "success" } };
  }

  /**
   * Detailed view of one pool opportunity.
   *
   * @throws {@link OffchainNotImplementedError} until the backend client is
   * implemented.
   **/
  public async getPool(
    key: PoolOpportunityKey,
  ): Promise<OffchainResult<PoolOpportunityDetail>> {
    void key;
    throw new OffchainNotImplementedError("opportunities.getPool");
  }

  /**
   * Detailed view of one strategy opportunity.
   *
   * @throws {@link OffchainNotImplementedError} until the backend client is
   * implemented.
   **/
  public async getStrategy(
    key: StrategyOpportunityKey,
  ): Promise<OffchainResult<StrategyOpportunityDetail>> {
    void key;
    throw new OffchainNotImplementedError("opportunities.getStrategy");
  }

  /**
   * Historical series of one opportunity. History exists only here: rebuilding
   * it from the chain would mean an archive read per point.
   *
   * @returns An empty list until the backend client is implemented.
   **/
  public async getHistory(
    query: HistoryQuery,
  ): Promise<OffchainResult<HistorySeries[]>> {
    this.#logger?.debug(
      { query },
      "offchain opportunities history is not implemented, serving empty list",
    );
    return { result: [], meta: { status: "success" } };
  }
}
