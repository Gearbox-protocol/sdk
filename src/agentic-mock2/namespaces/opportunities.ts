import type { Address, NetworkType, SDKContext } from "../core/index.js";
import type { Opportunity } from "../entities/index.js";
import { PoolOpportunity, StrategyOpportunity } from "../entities/index.js";

// ============================================================================
// Filter
// ============================================================================

export interface OpportunityFilter {
  networks?: NetworkType[];
  types?: Array<"pool" | "strategy">;
  underlying?: Address;
  minApy?: number;
  kycRequired?: boolean;
}

// ============================================================================
// Public type
// ============================================================================

export interface OpportunitiesNamespace {
  findMany(filter?: OpportunityFilter): Opportunity[];
  findOne(id: string): Opportunity | undefined;
}

// ============================================================================
// Implementation (non-generic)
// ============================================================================

export class OpportunitiesNamespaceImpl {
  readonly #ctx: SDKContext;

  constructor(ctx: SDKContext) {
    this.#ctx = ctx;
  }

  findMany(filter?: OpportunityFilter): Opportunity[] {
    const offOpps = this.#ctx.offchain?.opportunities ?? [];

    let results: Opportunity[] = offOpps.map(o => {
      const offMarket = this.#ctx.offchain?.markets.find(
        m => m.pool.address === o.poolAddress,
      );
      const network = offMarket?.network as NetworkType | undefined;
      const onchain = network
        ? this.#ctx.multichain?.chain(network).findMarket(o.poolAddress)
        : undefined;

      if (o.type === "strategy") {
        return new StrategyOpportunity(this.#ctx, o, onchain);
      }
      return new PoolOpportunity(this.#ctx, o, onchain);
    });

    if (!filter) return results;

    if (filter.networks) {
      const networkPools = new Set(
        (this.#ctx.offchain?.markets ?? [])
          .filter(m => filter.networks!.includes(m.network as NetworkType))
          .map(m => m.pool.address),
      );
      results = results.filter(o => networkPools.has(o.poolAddress));
    }
    if (filter.types) {
      results = results.filter(o => filter.types!.includes(o.type));
    }
    if (filter.underlying) {
      results = results.filter(o => o.underlying === filter.underlying);
    }
    if (filter.minApy !== undefined) {
      results = results.filter(o => {
        const apy =
          o.type === "pool" ? o.supplyApy : (o as StrategyOpportunity).basicApy;
        return apy >= filter.minApy!;
      });
    }
    if (filter.kycRequired !== undefined) {
      results = results.filter(o => o.kycRequired === filter.kycRequired);
    }
    return results;
  }

  findOne(id: string): Opportunity | undefined {
    const offOpp = this.#ctx.offchain?.opportunities.find(o => o.id === id);
    if (!offOpp) return undefined;

    const offMarket = this.#ctx.offchain?.markets.find(
      m => m.pool.address === offOpp.poolAddress,
    );
    const network = offMarket?.network as NetworkType | undefined;
    const onchain = network
      ? this.#ctx.multichain?.chain(network).findMarket(offOpp.poolAddress)
      : undefined;

    if (offOpp.type === "strategy") {
      return new StrategyOpportunity(this.#ctx, offOpp, onchain);
    }
    return new PoolOpportunity(this.#ctx, offOpp, onchain);
  }
}
