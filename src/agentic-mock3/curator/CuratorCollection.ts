import { BaseCollection, type Mode } from "../core/index.js";
import type { Market, MarketType } from "../market/Market.js";
import { MarketCollection } from "../market/MarketCollection.js";
import {
  type Opportunity,
  OpportunityCollection,
  PoolOpportunityCollection,
  type PoolOpportunityType,
  StrategyOpportunityCollection,
  type StrategyOpportunityType,
} from "../opportunity/index.js";
import type { Curator } from "./Curator.js";

export class CuratorCollection extends BaseCollection<Curator> {
  // ============================================================================
  // Filters
  // ============================================================================

  public withNames(...substrings: string[]): CuratorCollection {
    if (substrings.length === 0) return this.wrap([...this.items]);
    const lower = substrings.map(s => s.toLowerCase());
    return new CuratorCollection(
      this.ctx,
      this.items.filter(c =>
        lower.some(sub => c.name.toLowerCase().includes(sub)),
      ),
    );
  }

  /**
   * Filters curators by maximum bad debt in USD.
   * Pass `0` to keep only curators with zero bad debt.
   */
  public withMaxBadDebt(maxUsd: number): CuratorCollection {
    return new CuratorCollection(
      this.ctx,
      this.items.filter(c =>
        maxUsd === 0 ? c.badDebtUsd === 0 : c.badDebtUsd <= maxUsd,
      ),
    );
  }

  public withMinTvl(minUsd: number): CuratorCollection {
    return new CuratorCollection(
      this.ctx,
      this.items.filter(c => c.tvlUsd >= minUsd),
    );
  }

  // ============================================================================
  // Navigation -- markets aggregated by marketConfigurator + chainId
  // ============================================================================

  public get markets(): MarketCollection<Mode> {
    const refs = this.#mcSet();
    const items = this.ctx.markets.all().filter(item => {
      const market = item as unknown as Market;
      const key = `${market.chainId}:${market.marketConfigurator.toLowerCase()}`;
      return refs.has(key);
    });
    return new MarketCollection<Mode>(this.ctx, items as MarketType<Mode>[]);
  }

  // ============================================================================
  // Navigation -- opportunities aggregated by curatorId
  // ============================================================================

  public get opportunities(): OpportunityCollection<Mode> {
    const ids = this.#idSet();
    const opps = this.ctx.opportunities
      .all()
      .filter(o => ids.has(o.curator.id));
    return new OpportunityCollection<Mode>(
      this.ctx,
      opps as unknown as Opportunity<Mode>[],
    );
  }

  public get poolOpportunities(): PoolOpportunityCollection<Mode> {
    const ids = this.#idSet();
    const opps = this.ctx.opportunities
      .pools()
      .all()
      .filter(o => ids.has(o.curator.id));
    return new PoolOpportunityCollection<Mode>(
      this.ctx,
      opps as unknown as PoolOpportunityType<Mode>[],
    );
  }

  public get strategyOpportunities(): StrategyOpportunityCollection<Mode> {
    const ids = this.#idSet();
    const opps = this.ctx.opportunities
      .strategies()
      .all()
      .filter(o => ids.has(o.curator.id));
    return new StrategyOpportunityCollection<Mode>(
      this.ctx,
      opps as unknown as StrategyOpportunityType<Mode>[],
    );
  }

  protected wrap(items: Curator[]): this {
    return new CuratorCollection(this.ctx, items) as this;
  }

  #idSet(): Set<string> {
    const set = new Set<string>();
    for (const c of this.items) set.add(c.id);
    return set;
  }

  #mcSet(): Set<string> {
    const set = new Set<string>();
    for (const c of this.items) {
      for (const ref of c.marketConfigurators) {
        set.add(`${ref.chainId}:${ref.address.toLowerCase()}`);
      }
    }
    return set;
  }
}
