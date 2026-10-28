import { stableStringify } from "../utils/objectUtils.js";

/**
 * Memoized `resolve` results, keyed by action type, market identity and
 * params.
 *
 * A definition's `resolve` depends on nothing else (see
 * `MarketActionDefinition.resolve`), so replaying the same actions — once per
 * bundle merge, once more for the final compilation — reads the chain once.
 * A rejected resolution is not kept, so a retry runs again.
 **/
export class ResolveCache {
  readonly #entries = new Map<string, Promise<unknown>>();

  run<R>(key: unknown, compute: () => Promise<R>): Promise<R> {
    const id = stableStringify(key);
    let entry = this.#entries.get(id) as Promise<R> | undefined;
    if (!entry) {
      entry = compute();
      this.#entries.set(id, entry);
      entry.catch(() => {
        if (this.#entries.get(id) === entry) this.#entries.delete(id);
      });
    }
    return entry;
  }
}
