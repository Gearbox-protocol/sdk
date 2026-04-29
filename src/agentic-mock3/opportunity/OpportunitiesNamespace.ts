import type { Mode, SDKContext } from "../core/index.js";
import { OpportunityCollection } from "./OpportunityCollection.js";
import { PoolOpportunity } from "./PoolOpportunity.js";
import { StrategyOpportunity } from "./StrategyOpportunity.js";

export class OpportunitiesNamespace<
  M extends Mode,
> extends OpportunityCollection<M> {
  constructor(ctx: SDKContext) {
    super(ctx, []);
    for (const o of ctx.offchain?.opportunities ?? []) {
      if (o.type === "pool") {
        this.items.push(new PoolOpportunity(ctx, o));
      } else {
        this.items.push(new StrategyOpportunity(ctx, o));
      }
    }
  }
}
