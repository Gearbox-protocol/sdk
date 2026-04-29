/**
 * Curator entity — purely offchain, no Mode dependency.
 * Provides navigation to markets and opportunities via SDKContext.
 */
import type { SDKContext } from "../core/index.js";
import type { OffchainCurator } from "../offchain/index.js";
import { Market } from "./market.js";
import type { Opportunity } from "./opportunity.js";
import { PoolOpportunity, StrategyOpportunity } from "./opportunity.js";

export class Curator {
  readonly #ctx: SDKContext;
  readonly #offchain: OffchainCurator;

  constructor(ctx: SDKContext, offchain: OffchainCurator) {
    this.#ctx = ctx;
    this.#offchain = offchain;
  }

  get name(): string {
    return this.#offchain.name;
  }

  get link(): string | null {
    return this.#offchain.link;
  }

  get description(): string | null {
    return this.#offchain.description;
  }

  // -- Navigation ------------------------------------------------------------

  /** All markets managed by this curator, across all chains. */
  get markets(): Market[] {
    const results: Market[] = [];
    for (const mc of this.#offchain.marketConfigurators) {
      for (const poolAddress of mc.poolAddresses) {
        const offMarket = this.#ctx.offchain?.markets.find(
          m =>
            m.pool.address === poolAddress &&
            m.curatorName === this.#offchain.name,
        );
        if (!offMarket) continue;
        const network = offMarket.network;
        const onchain = this.#ctx.multichain
          ?.chain(network as any)
          .findMarket(poolAddress);
        results.push(new Market(this.#ctx, offMarket, onchain));
      }
    }
    return results;
  }

  /**
   * All opportunities across all markets managed by this curator.
   * Joins: curator -> market configurators -> pool addresses -> opportunities.
   */
  get opportunities(): Opportunity[] {
    const poolAddresses = new Set(
      this.#offchain.marketConfigurators.flatMap(mc => mc.poolAddresses),
    );
    const offOpps =
      this.#ctx.offchain?.opportunities.filter(o =>
        poolAddresses.has(o.poolAddress),
      ) ?? [];

    return offOpps.map(o => {
      const offMarket = this.#ctx.offchain?.markets.find(
        m => m.pool.address === o.poolAddress,
      );
      const network = offMarket?.network;
      const onchain = network
        ? this.#ctx.multichain?.chain(network as any).findMarket(o.poolAddress)
        : undefined;
      if (o.type === "strategy") {
        return new StrategyOpportunity(this.#ctx, o, onchain);
      }
      return new PoolOpportunity(this.#ctx, o, onchain);
    });
  }
}
