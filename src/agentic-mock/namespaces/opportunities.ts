import type { Address, NetworkType } from "../core/index.js";
import type { Opportunity, PoolOpportunityImpl } from "../entities/index.js";

export interface OpportunityFilter {
  networks?: NetworkType[];
  types?: Array<"pool" | "strategy">;
  underlying?: Address;
  minApy?: number;
}

export interface OpportunitiesNamespace {
  find(filter?: OpportunityFilter): Opportunity[];
}

export class OpportunitiesNamespaceImpl implements OpportunitiesNamespace {
  readonly #opportunities: PoolOpportunityImpl[];

  constructor(opportunities: PoolOpportunityImpl[]) {
    this.#opportunities = opportunities;
  }

  find(filter?: OpportunityFilter): Opportunity[] {
    let result: Opportunity[] = this.#opportunities;
    if (!filter) return result;

    if (filter.networks) {
      result = result.filter(o => filter.networks!.includes(o.network));
    }
    if (filter.types) {
      result = result.filter(o => filter.types!.includes(o.type));
    }
    if (filter.underlying) {
      result = result.filter(o => o.underlying === filter.underlying);
    }
    if (filter.minApy !== undefined) {
      result = result.filter(o => o.apy >= filter.minApy!);
    }
    return result;
  }
}
