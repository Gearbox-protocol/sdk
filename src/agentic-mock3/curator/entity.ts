import type { SDKContext } from "../core/index.js";
import { GearboxEntity } from "../core/index.js";
import { Market } from "../market/entity.js";
import type { OffchainCurator } from "../offchain/index.js";
import type { Opportunity } from "../opportunity/entity.js";
import { PoolOpportunity, StrategyOpportunity } from "../opportunity/entity.js";

export class Curator extends GearboxEntity {
  readonly #offchain: OffchainCurator;

  constructor(ctx: SDKContext, offchain: OffchainCurator) {
    super(ctx);
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

  get markets(): Market[] {
    const results: Market[] = [];
    for (const mc of this.#offchain.marketConfigurators) {
      for (const poolAddress of mc.poolAddresses) {
        const offMarket = this.offchain.markets.find(
          m =>
            m.pool.address === poolAddress &&
            m.curatorName === this.#offchain.name,
        );
        if (!offMarket) continue;
        const network = offMarket.network;
        const onchain = this.multichainOrNull
          ?.chain(network as any)
          .findMarket(poolAddress);
        results.push(new Market(this.ctx, offMarket, onchain));
      }
    }
    return results;
  }

  get opportunities(): Opportunity[] {
    const poolAddresses = new Set(
      this.#offchain.marketConfigurators.flatMap(mc => mc.poolAddresses),
    );
    const offOpps = this.offchain.opportunities.filter(o =>
      poolAddresses.has(o.poolAddress),
    );

    return offOpps.map(o => {
      const offMarket = this.offchain.markets.find(
        m => m.pool.address === o.poolAddress,
      );
      const network = offMarket?.network;
      const onchain = network
        ? this.multichainOrNull?.chain(network as any).findMarket(o.poolAddress)
        : undefined;
      if (o.type === "strategy") {
        return new StrategyOpportunity(this.ctx, o, onchain);
      }
      return new PoolOpportunity(this.ctx, o, onchain);
    });
  }
}
