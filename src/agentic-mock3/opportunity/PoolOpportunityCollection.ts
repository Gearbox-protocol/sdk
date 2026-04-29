import { BaseCollection, type Mode } from "../core/index.js";
import { matchUnderlying } from "./filters.js";
import type { PoolOpportunityType } from "./types.js";

export class PoolOpportunityCollection<M extends Mode> extends BaseCollection<
  PoolOpportunityType<M>,
  M
> {
  withUnderlying(query: string | RegExp): PoolOpportunityCollection<M> {
    return new PoolOpportunityCollection<M>(
      this.ctx,
      this.items.filter(o => matchUnderlying(o.underlyingToken, query)),
    );
  }

  protected wrap(items: PoolOpportunityType<M>[]): this {
    return new PoolOpportunityCollection<M>(this.ctx, items) as this;
  }
}
