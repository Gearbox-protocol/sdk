import { BaseCollection, type Mode } from "../core/index.js";
import { matchUnderlying } from "./filters.js";
import type { StrategyOpportunityType } from "./types.js";

export class StrategyOpportunityCollection<
  M extends Mode,
> extends BaseCollection<StrategyOpportunityType<M>, M> {
  withUnderlying(query: string | RegExp): StrategyOpportunityCollection<M> {
    return new StrategyOpportunityCollection<M>(
      this.ctx,
      this.items.filter(o => matchUnderlying(o.underlyingToken, query)),
    );
  }

  protected wrap(items: StrategyOpportunityType<M>[]): this {
    return new StrategyOpportunityCollection<M>(this.ctx, items) as this;
  }
}
