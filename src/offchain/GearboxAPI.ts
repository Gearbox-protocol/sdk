import type { ChainId } from "../model/primitives.js";
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
 * const { result } = await api.opportunities.list({ kind: "strategy" });
 * ```
 *
 * Every read is scoped to {@link GearboxAPIOptions.chainIds}, so a client only
 * ever sees the chains it was built for even though the backend knows more.
 *
 * The backend imports the read model from this package and its endpoints
 * return those types directly, so there is no wire DTO layer here — only
 * transport and schema validation.
 *
 * The transport is not implemented yet; see {@link OffchainOpportunities} and
 * {@link OffchainPositions} for what each stubbed endpoint currently answers.
 **/
export class GearboxAPI {
  /**
   * Chains every read of this client is scoped to, see
   * {@link GearboxAPIOptions.chainIds}.
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

  constructor(options: GearboxAPIOptions) {
    this.chainIds = [...options.chainIds];
    this.opportunities = new OffchainOpportunities(options);
    this.positions = new OffchainPositions(options);
  }
}
