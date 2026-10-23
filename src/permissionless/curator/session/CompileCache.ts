/**
 * Serializes compilations of one builder and caches the result per revision.
 *
 * Builder methods only record intent, so a compilation is pure with respect to a
 * revision number: two `preview()` calls at the same revision share one
 * compilation, and any recorded intent invalidates it. Runs are chained so two
 * concurrent calls can never interleave their RPC work.
 **/
export class CompileCache<T> {
  #revision = Number.NaN;
  #value?: Promise<T>;
  #queue: Promise<unknown> = Promise.resolve();

  run(revision: number, compile: () => Promise<T>): Promise<T> {
    const result = this.#queue.then(() => {
      if (this.#revision === revision && this.#value) return this.#value;
      const value = compile();
      this.#revision = revision;
      this.#value = value;
      return value.catch((error: unknown) => {
        // A failed compilation is not cached, so fixing the cause and retrying
        // at the same revision works.
        if (this.#revision === revision) {
          this.#revision = Number.NaN;
          this.#value = undefined;
        }
        throw error;
      });
    });
    this.#queue = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  }
}

/** Same contract as {@link CompileCache}, keyed by revision plus a string key. **/
export class KeyedCompileCache<T> {
  readonly #caches = new Map<string, CompileCache<T>>();

  run(revision: number, key: string, compile: () => Promise<T>): Promise<T> {
    let cache = this.#caches.get(key);
    if (!cache) {
      cache = new CompileCache<T>();
      this.#caches.set(key, cache);
    }
    return cache.run(revision, compile);
  }
}
