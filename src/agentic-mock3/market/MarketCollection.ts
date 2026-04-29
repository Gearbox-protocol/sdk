import type { Address } from "viem";
import type { NetworkType } from "../../sdk/index.js";
import {
  BaseCollection,
  type Caps,
  type IBaseCollection,
  type Mode,
} from "../core/index.js";
import { matchToken, type TokenQuery } from "../opportunity/filters.js";
import {
  type Opportunity,
  OpportunityCollection,
  PoolOpportunityCollection,
  type PoolOpportunityType,
  StrategyOpportunityCollection,
  type StrategyOpportunityType,
} from "../opportunity/index.js";
import type { Market, MarketType } from "./Market.js";

export interface MarketCollectionBase<M extends Mode>
  extends IBaseCollection<MarketType<M>, MarketCollectionType<M>> {
  withNetworks(...networks: NetworkType[]): MarketCollectionType<M>;
  withUnderlyings(...tokens: Array<string | Address>): MarketCollectionType<M>;
}

export type MarketCollectionType<M extends Mode> = MarketCollectionBase<M> &
  Caps<M, "MarketCollection">;

export class MarketCollection<M extends Mode> extends BaseCollection<
  MarketType<M>,
  M
> {
  // ============================================================================
  // Common filters
  // ============================================================================

  public withNetworks(...networks: NetworkType[]): MarketCollection<M> {
    return new MarketCollection<M>(
      this.ctx,
      this.items.filter(m => networks.includes(m.network)),
    );
  }

  public withUnderlyings(
    ...tokens: Array<string | Address>
  ): MarketCollection<M> {
    if (tokens.length === 0) return this.wrap([...this.items]);
    return new MarketCollection<M>(
      this.ctx,
      this.items.filter(m => tokens.some(t => matchToken(m.underlying, t))),
    );
  }

  // ============================================================================
  // Onchain filters
  // ============================================================================

  public withCollaterals(
    ...tokens: Array<string | Address>
  ): MarketCollection<M> {
    if (tokens.length === 0) return this.wrap([...this.items]);
    return new MarketCollection<M>(
      this.ctx,
      this.items.filter(item => {
        const market = item as unknown as Market;
        const collaterals = market.collateralTokens;
        return collaterals.some(addr => {
          const token = this.ctx.tokens.getOrCreate(addr, market.chainId);
          return tokens.some(q => matchToken(token, q as TokenQuery));
        });
      }),
    );
  }

  // ============================================================================
  // Navigation -- opportunities aggregated by poolAddress
  // ============================================================================

  public get opportunities(): OpportunityCollection<M> {
    const pools = this.#poolAddresses();
    const opps = this.ctx.opportunities
      .all()
      .filter(o => pools.has(o.market.poolAddress));
    return new OpportunityCollection<M>(
      this.ctx,
      opps as unknown as Opportunity<M>[],
    );
  }

  public get poolOpportunities(): PoolOpportunityCollection<M> {
    const pools = this.#poolAddresses();
    const opps = this.ctx.opportunities
      .pools()
      .all()
      .filter(o => pools.has(o.market.poolAddress));
    return new PoolOpportunityCollection<M>(
      this.ctx,
      opps as unknown as PoolOpportunityType<M>[],
    );
  }

  public get strategyOpportunities(): StrategyOpportunityCollection<M> {
    const pools = this.#poolAddresses();
    const opps = this.ctx.opportunities
      .strategies()
      .all()
      .filter(o => pools.has(o.market.poolAddress));
    return new StrategyOpportunityCollection<M>(
      this.ctx,
      opps as unknown as StrategyOpportunityType<M>[],
    );
  }

  #poolAddresses(): Set<Address> {
    const set = new Set<Address>();
    for (const m of this.items) set.add(m.poolAddress);
    return set;
  }

  protected wrap(items: MarketType<M>[]): this {
    return new MarketCollection<M>(this.ctx, items) as this;
  }
}
