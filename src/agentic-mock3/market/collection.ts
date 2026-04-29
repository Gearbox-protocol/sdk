import type {
  Address,
  Caps,
  IBaseCollection,
  Mode,
  NetworkType,
  SDKContext,
} from "../core/index.js";
import { BaseCollection } from "../core/index.js";
import { OpportunityCollection } from "../opportunity/collection.js";
import type { Opportunity } from "../opportunity/entity.js";
import { PoolOpportunity, StrategyOpportunity } from "../opportunity/entity.js";
import type { Market, MarketType } from "./entity.js";

// ============================================================================
// Public types
// ============================================================================

export interface MarketCollectionBase<M extends Mode>
  extends IBaseCollection<MarketType<M>, MarketCollectionType<M>> {
  withNetworks(...networks: NetworkType[]): MarketCollectionType<M>;
  withUnderlyings(...tokens: Address[]): MarketCollectionType<M>;
  withCurators(...names: string[]): MarketCollectionType<M>;
}

export type MarketCollectionType<M extends Mode> = MarketCollectionBase<M> &
  Caps<M, "MarketCollection">;

// ============================================================================
// Implementation
// ============================================================================

export class MarketCollection<M extends Mode> extends BaseCollection<
  MarketType<M>,
  M
> {
  constructor(ctx: SDKContext, items: MarketType<M>[]) {
    super(ctx, items);
  }

  withNetworks(...networks: NetworkType[]): MarketCollection<M> {
    return new MarketCollection<M>(
      this.ctx,
      this.items.filter(m => networks.includes(m.network)),
    );
  }

  withUnderlyings(...tokens: Address[]): MarketCollection<M> {
    return new MarketCollection<M>(
      this.ctx,
      this.items.filter(m => tokens.includes(m.underlying)),
    );
  }

  withCurators(...names: string[]): MarketCollection<M> {
    return new MarketCollection<M>(
      this.ctx,
      this.items.filter(m => {
        const market = m as unknown as Market;
        const curator = market.curator;
        return curator !== undefined && names.includes(curator.name);
      }),
    );
  }

  get opportunities(): OpportunityCollection<M> {
    const allOpps: Opportunity[] = [];
    for (const m of this.items) {
      const market = m as unknown as Market;
      const offOpps = this.offchain.findOpportunitiesByPool(market.poolAddress);
      for (const o of offOpps) {
        const onchain = this.multichainOrNull
          ?.chain(market.network)
          .findMarket(market.poolAddress);
        if (o.type === "strategy") {
          allOpps.push(new StrategyOpportunity(this.ctx, o, onchain));
        } else {
          allOpps.push(new PoolOpportunity(this.ctx, o, onchain));
        }
      }
    }
    return new OpportunityCollection<M>(this.ctx, allOpps);
  }

  protected wrap(items: MarketType<M>[]): this {
    return new MarketCollection<M>(this.ctx, items) as this;
  }
}
