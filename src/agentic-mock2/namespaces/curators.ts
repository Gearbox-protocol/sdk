import type { SDKContext } from "../core/index.js";
import { Curator } from "../entities/index.js";

// ============================================================================
// Filter
// ============================================================================

export interface CuratorFilter {
  name?: string;
}

// ============================================================================
// Public type (no Mode dependency — curators are purely offchain)
// ============================================================================

export interface CuratorsNamespace {
  findMany(filter?: CuratorFilter): Curator[];
  findOne(name: string): Curator | undefined;
}

// ============================================================================
// Implementation
// ============================================================================

export class CuratorsNamespaceImpl {
  readonly #ctx: SDKContext;

  constructor(ctx: SDKContext) {
    this.#ctx = ctx;
  }

  findMany(filter?: CuratorFilter): Curator[] {
    const offCurators = this.#ctx.offchain?.curators ?? [];

    let results = offCurators;

    if (filter?.name) {
      results = results.filter(c =>
        c.name.toLowerCase().includes(filter.name!.toLowerCase()),
      );
    }

    return results.map(c => new Curator(this.#ctx, c));
  }

  findOne(name: string): Curator | undefined {
    const offCurator = this.#ctx.offchain?.findCurator(name);
    if (!offCurator) return undefined;
    return new Curator(this.#ctx, offCurator);
  }
}
