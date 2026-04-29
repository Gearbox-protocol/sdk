import { BaseCollection, type Mode, type SDKContext } from "../core/index.js";
import type { StrategyOpportunity } from "./entity.js";

export class StrategyOpportunityCollection<
  M extends Mode,
> extends BaseCollection<StrategyOpportunity, M> {
  minBasicApy(threshold: number): StrategyOpportunityCollection<M> {
    return new StrategyOpportunityCollection<M>(
      this.ctx,
      this.items.filter(o => o.basicApy >= threshold),
    );
  }

  withUnderlyings(...tokens: Address[]): StrategyOpportunityCollection<M> {
    return new StrategyOpportunityCollection<M>(
      this.ctx,
      this.items.filter(o => tokens.includes(o.underlying)),
    );
  }

  protected wrap(items: StrategyOpportunity[]): this {
    return new StrategyOpportunityCollection<M>(this.ctx, items) as this;
  }
}
