import type { Address } from "viem";
import type { NetworkType } from "../../sdk/index.js";
import { BaseCollection, type Mode } from "../core/index.js";
import type { Opportunity } from "./entity.js";
import type { PoolOpportunity } from "./PoolOpportunity.js";
import { PoolOpportunityCollection } from "./PoolOpportunityCollection.js";
import type { StrategyOpportunity } from "./StrategyOpportunity.js";
import { StrategyOpportunityCollection } from "./StrategyOpportunityCollection.js";

export class OpportunityCollection<M extends Mode> extends BaseCollection<
  Opportunity,
  M
> {
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
      this.items.filter(o => o.type === "pool"),
    );
  }

  strategies(): StrategyOpportunityCollection<M> {
    return new StrategyOpportunityCollection<M>(
      this.ctx,
      this.items.filter(o => o.type === "strategy"),
    );
  }

  protected wrap(items: Opportunity[]): this {
    return new OpportunityCollection<M>(this.ctx, items) as this;
  }
}
