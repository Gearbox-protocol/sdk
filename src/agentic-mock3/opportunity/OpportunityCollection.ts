import { BaseCollection, type Mode } from "../core/index.js";
import { matchUnderlying } from "./filters.js";
import { PoolOpportunityCollection } from "./PoolOpportunityCollection.js";
import { StrategyOpportunityCollection } from "./StrategyOpportunityCollection.js";
import type {
  Opportunity,
  PoolOpportunityType,
  StrategyOpportunityType,
} from "./types.js";

export class OpportunityCollection<M extends Mode> extends BaseCollection<
  Opportunity<M>,
  M
> {
  withUnderlying(query: string | RegExp): OpportunityCollection<M> {
    return new OpportunityCollection<M>(
      this.ctx,
      this.items.filter(o => matchUnderlying(o.underlyingToken, query)),
    );
  }

  public pools(): PoolOpportunityCollection<M> {
    const pools = this.items.filter(
      (o): o is PoolOpportunityType<M> => o.type === "pool",
    );
    return new PoolOpportunityCollection<M>(this.ctx, pools);
  }

  public strategies(): StrategyOpportunityCollection<M> {
    const strategies = this.items.filter(
      (o): o is StrategyOpportunityType<M> => o.type === "strategy",
    );
    return new StrategyOpportunityCollection<M>(this.ctx, strategies);
  }

  protected wrap(items: Opportunity<M>[]): this {
    return new OpportunityCollection<M>(this.ctx, items) as this;
  }
}
