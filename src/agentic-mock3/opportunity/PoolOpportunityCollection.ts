import { BaseCollection, type Mode } from "../core/index.js";
import {
  byCollaterals,
  byKyc,
  byRisk,
  matchToken,
  type TokenQuery,
} from "./filters.js";
import type { PoolOpportunityType, RiskLevel } from "./types.js";

export class PoolOpportunityCollection<M extends Mode> extends BaseCollection<
  PoolOpportunityType<M>,
  M
> {
  public withUnderlying(query: string | RegExp): PoolOpportunityCollection<M> {
    return this.wrap(
      this.items.filter(o => matchToken(o.underlyingToken, query)),
    );
  }

  public withRisk(...levels: RiskLevel[]): PoolOpportunityCollection<M> {
    return this.wrap(this.items.filter(byRisk(...levels)));
  }

  public withKYC(): PoolOpportunityCollection<M> {
    return this.wrap(this.items.filter(byKyc(true)));
  }

  public withoutKYC(): PoolOpportunityCollection<M> {
    return this.wrap(this.items.filter(byKyc(false)));
  }

  public withMinTotalYield(value: number): PoolOpportunityCollection<M> {
    return this.wrap(this.items.filter(o => o.yield.totalApy >= value));
  }

  public withMinBaseYield(value: number): PoolOpportunityCollection<M> {
    return this.wrap(this.items.filter(o => o.yield.baseApy >= value));
  }

  public withMinTvlUSD(value: number): PoolOpportunityCollection<M> {
    return this.wrap(this.items.filter(o => o.tvlUsd >= value));
  }

  public withCollaterals(
    ...tokens: TokenQuery[]
  ): PoolOpportunityCollection<M> {
    return this.wrap(this.items.filter(byCollaterals(...tokens)));
  }

  protected wrap(items: PoolOpportunityType<M>[]): this {
    return new PoolOpportunityCollection<M>(this.ctx, items) as this;
  }
}
