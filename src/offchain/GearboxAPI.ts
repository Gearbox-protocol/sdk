import type { ChainId } from "../model/primitives.js";
import { OffchainNotices } from "./notices/index.js";
import { OffchainOpportunities } from "./opportunities/index.js";
import { OffchainPositions } from "./positions/index.js";
import type { GearboxAPIOptions } from "./types.js";

/**
 * Client for the Gearbox backend, the off-chain source of the read model.
 *
 * It mirrors the namespace layout of the combined `GearboxSDK`, so the same
 * call reads the same way against either source:
 *
 * ```ts
 * const api = new GearboxAPI({
 *   baseUrl: "https://api.gearbox.fi",
 *   chainIds: [1, 42161],
 * });
 * const { data } = await api.opportunities.list({ kind: "strategy" });
 * ```
 *
 * Every read is scoped to {@link GearboxAPIOptions.chainIds}, so a client only
 * ever sees the chains it was built for even though the backend knows more.
 **/
export class GearboxAPI {
  /**
   * Chains every read of this client is scoped to.
   **/
  public readonly chainIds: readonly ChainId[];
  /**
   * Namespace for pool and strategy opportunities.
   **/
  public readonly opportunities: OffchainOpportunities;
  /**
   * Namespace for the positions a wallet holds.
   **/
  public readonly positions: OffchainPositions;
  /**
   * Namespace for the notices the backend attaches to entities.
   **/
  public readonly notices: OffchainNotices;

  constructor(options: GearboxAPIOptions) {
    this.chainIds = [...options.chainIds];
    this.opportunities = new OffchainOpportunities(options);
    this.positions = new OffchainPositions(options);
    this.notices = new OffchainNotices(options);
  }
}
