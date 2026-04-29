import type { Address, Mode, NetworkType, SDKContext } from "../core/index.js";
import type { MarketType } from "../entities/index.js";
import { Market } from "../entities/index.js";

// ============================================================================
// Filter
// ============================================================================

export interface MarketFilter {
  network?: NetworkType;
  networks?: NetworkType[];
  underlying?: Address;
}

// ============================================================================
// Public type (generic — used in GearboxSDK<M>)
// ============================================================================

export interface MarketsNamespace<M extends Mode> {
  findMany(filter?: MarketFilter): MarketType<M>[];
  findOne(
    network: NetworkType,
    poolAddress: Address,
  ): MarketType<M> | undefined;
}

// ============================================================================
// Implementation (non-generic — always has all methods)
// ============================================================================

export class MarketsNamespaceImpl {
  readonly #ctx: SDKContext;

  constructor(ctx: SDKContext) {
    this.#ctx = ctx;
  }

  findMany(filter?: MarketFilter): Market[] {
    const offMarkets = this.#ctx.offchain?.markets ?? [];

    let results = offMarkets.map(offM => {
      const network = offM.network as NetworkType;
      const onchain = this.#ctx.multichain
        ?.chain(network)
        .findMarket(offM.pool.address);
      return new Market(this.#ctx, offM, onchain);
    });

    if (!filter) return results;

    if (filter.networks) {
      results = results.filter(m => filter.networks!.includes(m.network));
    }
    if (filter.network) {
      results = results.filter(m => m.network === filter.network);
    }
    if (filter.underlying) {
      results = results.filter(m => m.underlying === filter.underlying);
    }
    return results;
  }

  findOne(network: NetworkType, poolAddress: Address): Market | undefined {
    const offM = this.#ctx.offchain?.findMarket(network, poolAddress);
    if (!offM) return undefined;
    const onchain = this.#ctx.multichain
      ?.chain(network)
      .findMarket(poolAddress);
    return new Market(this.#ctx, offM, onchain);
  }
}
