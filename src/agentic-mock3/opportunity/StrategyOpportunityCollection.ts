import { BaseCollection, type Mode } from "../core/index.js";
import {
  byCollaterals,
  byDebtOverlap,
  byKyc,
  byMaxLeverage,
  byNoDelayedWithdrawal,
  byRisk,
  byTargetCollateral,
  matchToken,
  type TokenQuery,
} from "./filters.js";
import type { RiskLevel, StrategyOpportunityType } from "./types.js";

export class StrategyOpportunityCollection<
  M extends Mode,
> extends BaseCollection<StrategyOpportunityType<M>, M> {
  public withUnderlying(
    query: string | RegExp,
  ): StrategyOpportunityCollection<M> {
    return this.wrap(
      this.items.filter(o => matchToken(o.underlyingToken, query)),
    );
  }

  public withRisk(...levels: RiskLevel[]): StrategyOpportunityCollection<M> {
    return this.wrap(this.items.filter(byRisk(...levels)));
  }

  public withKYC(): StrategyOpportunityCollection<M> {
    return this.wrap(this.items.filter(byKyc(true)));
  }

  public withoutKYC(): StrategyOpportunityCollection<M> {
    return this.wrap(this.items.filter(byKyc(false)));
  }

  public withMinTotalYield(value: number): StrategyOpportunityCollection<M> {
    return this.wrap(
      this.items.filter(
        o => o.maxLeveragedTargetCollateralYield.totalApy >= value,
      ),
    );
  }

  public withMinBaseYield(value: number): StrategyOpportunityCollection<M> {
    return this.wrap(
      this.items.filter(
        o => o.maxLeveragedTargetCollateralYield.baseApy >= value,
      ),
    );
  }

  public withMinTvlUSD(value: number): StrategyOpportunityCollection<M> {
    return this.wrap(this.items.filter(o => o.totalValue >= value));
  }

  public withCollaterals(
    ...tokens: TokenQuery[]
  ): StrategyOpportunityCollection<M> {
    return this.wrap(this.items.filter(byCollaterals(...tokens)));
  }

  // -- Strategy-only filters -------------------------------------------------

  public withTargetCollateral(
    token: TokenQuery,
  ): StrategyOpportunityCollection<M> {
    return this.wrap(this.items.filter(byTargetCollateral(token)));
  }

  public withDebt(range: {
    min?: number;
    max?: number;
  }): StrategyOpportunityCollection<M> {
    return this.wrap(this.items.filter(byDebtOverlap(range)));
  }

  public withoutDelayedWithdrawal(): StrategyOpportunityCollection<M> {
    return this.wrap(this.items.filter(byNoDelayedWithdrawal()));
  }

  public withMaxLeverage(value: number): StrategyOpportunityCollection<M> {
    return this.wrap(this.items.filter(byMaxLeverage(value)));
  }

  protected wrap(items: StrategyOpportunityType<M>[]): this {
    return new StrategyOpportunityCollection<M>(this.ctx, items) as this;
  }
}
