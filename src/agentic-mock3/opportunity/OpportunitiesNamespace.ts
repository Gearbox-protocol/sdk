import type { Mode, SDKContext } from "../core/index.js";
import { OpportunityCollection } from "./OpportunityCollection.js";
import { PoolOpportunity } from "./PoolOpportunity.js";
import { StrategyOpportunity } from "./StrategyOpportunity.js";
import type { Opportunity } from "./types.js";

export class OpportunitiesNamespace<
  M extends Mode,
> extends OpportunityCollection<M> {
  constructor(ctx: SDKContext<Mode>) {
    super(ctx, []);
    for (const o of ctx.offchain?.opportunities ?? []) {
      const entity =
        o.type === "pool"
          ? new PoolOpportunity(ctx, o)
          : new StrategyOpportunity(ctx, o);
      this.items.push(entity as unknown as Opportunity<M>);
    }
  }
}
