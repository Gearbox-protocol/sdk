import type { Mode, SDKContext } from "../core/index.js";
import { BaseCollection } from "../core/index.js";
import { MarketCollection } from "../market/collection.js";
import type { Market } from "../market/entity.js";
import type { Opportunity } from "../opportunity/index.js";
import { OpportunityCollection } from "../opportunity/index.js";
import type { Curator } from "./entity.js";

export class CuratorCollection extends BaseCollection<Curator> {
  constructor(ctx: SDKContext<Mode>, items: Curator[]) {
    super(ctx, items);
  }

  withNames(...substrings: string[]): CuratorCollection {
    const lower = substrings.map(s => s.toLowerCase());
    return new CuratorCollection(
      this.ctx,
      this.items.filter(c =>
        lower.some(sub => c.name.toLowerCase().includes(sub)),
      ),
    );
  }

  get markets(): MarketCollection<Mode> {
    const allMarkets: Market[] = [];
    const seen = new Set<string>();
    for (const curator of this.items) {
      for (const market of curator.markets) {
        const key = `${market.network}:${market.poolAddress}`;
        if (!seen.has(key)) {
          seen.add(key);
          allMarkets.push(market);
        }
      }
    }
    return new MarketCollection<Mode>(this.ctx, allMarkets);
  }

  get opportunities(): OpportunityCollection<Mode> {
    const allOpps: Opportunity<Mode>[] = [];
    const seen = new Set<string>();
    for (const curator of this.items) {
      for (const opp of curator.opportunities) {
        if (!seen.has(opp.id)) {
          seen.add(opp.id);
          allOpps.push(opp);
        }
      }
    }
    return new OpportunityCollection<Mode>(this.ctx, allOpps);
  }

  protected wrap(items: Curator[]): this {
    return new CuratorCollection(this.ctx, items) as this;
  }
}
