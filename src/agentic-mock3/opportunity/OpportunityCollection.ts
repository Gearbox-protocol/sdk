import { BaseCollection, type Mode } from "../core/index.js";
import {
  byCollaterals,
  byKyc,
  byRisk,
  matchToken,
  type TokenQuery,
} from "./filters.js";
import { PoolOpportunityCollection } from "./PoolOpportunityCollection.js";
import { StrategyOpportunityCollection } from "./StrategyOpportunityCollection.js";
import type {
  Opportunity,
  PoolOpportunityType,
  RiskLevel,
  StrategyOpportunityType,
} from "./types.js";

export class OpportunityCollection<M extends Mode> extends BaseCollection<
  Opportunity<M>,
  M
> {
  public withUnderlying(query: string | RegExp): OpportunityCollection<M> {
    return this.wrap(
      this.items.filter(o => matchToken(o.underlyingToken, query)),
    );
  }

  public withRisk(...levels: RiskLevel[]): OpportunityCollection<M> {
    return this.wrap(this.items.filter(byRisk(...levels)));
  }

  public withKYC(): OpportunityCollection<M> {
    return this.wrap(this.items.filter(byKyc(true)));
  }

  public withoutKYC(): OpportunityCollection<M> {
    return this.wrap(this.items.filter(byKyc(false)));
  }

  public withMinTotalYield(value: number): OpportunityCollection<M> {
    return this.wrap(
      this.items.filter(o =>
        o.type === "pool"
          ? o.yield.totalApy >= value
          : o.maxLeveragedTargetCollateralYield.totalApy >= value,
      ),
    );
  }

  public withMinBaseYield(value: number): OpportunityCollection<M> {
    return this.wrap(
      this.items.filter(o =>
        o.type === "pool"
          ? o.yield.baseApy >= value
          : o.maxLeveragedTargetCollateralYield.baseApy >= value,
      ),
    );
  }

  public withMinTvlUSD(value: number): OpportunityCollection<M> {
    return this.wrap(
      this.items.filter(o =>
        o.type === "pool" ? o.tvlUsd >= value : o.totalValue >= value,
      ),
    );
  }

  public withCollaterals(...tokens: TokenQuery[]): OpportunityCollection<M> {
    return this.wrap(this.items.filter(byCollaterals(...tokens)));
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
