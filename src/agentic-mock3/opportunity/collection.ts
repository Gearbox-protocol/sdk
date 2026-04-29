import type { Address, Mode, NetworkType, SDKContext } from "../core/index.js";
import { BaseCollection } from "../core/index.js";
import type {
  Opportunity,
  PoolOpportunity,
  StrategyOpportunity,
} from "./entity.js";

// ============================================================================
// OpportunityCollection<M>
// ============================================================================

export class OpportunityCollection<M extends Mode> extends BaseCollection<
  Opportunity,
  M
> {
  constructor(ctx: SDKContext, items: Opportunity[]) {
    super(ctx, items);
  }

  withNetworks(...networks: NetworkType[]): OpportunityCollection<M> {
    const networkPools = new Set(
      (this.offchainOrNull?.markets ?? [])
        .filter(m => networks.includes(m.network as NetworkType))
        .map(m => m.pool.address),
    );
    return new OpportunityCollection<M>(
      this.ctx,
      this.items.filter(o => networkPools.has(o.poolAddress)),
    );
  }

  withUnderlyings(...tokens: Address[]): OpportunityCollection<M> {
    return new OpportunityCollection<M>(
      this.ctx,
      this.items.filter(o => tokens.includes(o.underlying)),
    );
  }

  minApy(threshold: number): OpportunityCollection<M> {
    return new OpportunityCollection<M>(
      this.ctx,
      this.items.filter(o => {
        const apy =
          o.type === "pool"
            ? (o as PoolOpportunity).supplyApy
            : (o as StrategyOpportunity).basicApy;
        return apy >= threshold;
      }),
    );
  }

  kycFree(): OpportunityCollection<M> {
    return new OpportunityCollection<M>(
      this.ctx,
      this.items.filter(o => !o.kycRequired),
    );
  }

  pools(): PoolOpportunityCollection<M> {
    return new PoolOpportunityCollection<M>(
      this.ctx,
      this.items.filter((o): o is PoolOpportunity => o.type === "pool"),
    );
  }

  strategies(): StrategyOpportunityCollection<M> {
    return new StrategyOpportunityCollection<M>(
      this.ctx,
      this.items.filter((o): o is StrategyOpportunity => o.type === "strategy"),
    );
  }

  protected wrap(items: Opportunity[]): this {
    return new OpportunityCollection<M>(this.ctx, items) as this;
  }
}

// ============================================================================
// PoolOpportunityCollection<M>
// ============================================================================

export class PoolOpportunityCollection<M extends Mode> extends BaseCollection<
  PoolOpportunity,
  M
> {
  constructor(ctx: SDKContext, items: PoolOpportunity[]) {
    super(ctx, items);
  }

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

// ============================================================================
// StrategyOpportunityCollection<M>
// ============================================================================

export class StrategyOpportunityCollection<
  M extends Mode,
> extends BaseCollection<StrategyOpportunity, M> {
  constructor(ctx: SDKContext, items: StrategyOpportunity[]) {
    super(ctx, items);
  }

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
