import { BaseCollection, type Mode, type SDKContext } from "../core/index.js";
import type { PoolOpportunity } from "./entity.js";

export class PoolOpportunityCollection<M extends Mode> extends BaseCollection<
  PoolOpportunity,
  M
> {
  minApy(threshold: number): PoolOpportunityCollection<M> {
    return new PoolOpportunityCollection<M>(
      this.ctx,
      this.items.filter(o => o.supplyApy >= threshold),
    );
  }

  minTvlUsd(threshold: number): PoolOpportunityCollection<M> {
    return new PoolOpportunityCollection<M>(
      this.ctx,
      this.items.filter(o => o.tvlUsd >= threshold),
    );
  }

  kycFree(): PoolOpportunityCollection<M> {
    return new PoolOpportunityCollection<M>(
      this.ctx,
      this.items.filter(o => !o.kycRequired),
    );
  }

  withUnderlyings(...tokens: Address[]): PoolOpportunityCollection<M> {
    return new PoolOpportunityCollection<M>(
      this.ctx,
      this.items.filter(o => tokens.includes(o.underlying)),
    );
  }

  protected wrap(items: PoolOpportunity[]): this {
    return new PoolOpportunityCollection<M>(this.ctx, items) as this;
  }
}
