import type { TimestampedCalldata } from "./types.js";

export interface PriceUpdatesCacheOptions {
  /**
   * Assume that in historical mode we only need to fetch once and then reuse from cache forever
   */
  historical: boolean;
  /**
   * TTL in milliseconds
   */
  ttl: number;
}

export class PriceUpdatesCache {
  static #caches = new Map<string, PriceUpdatesCache>();

  /**
   * Price update caches can be shared across networks
   * @param id - unique key to identify the cache
   * @param opts
   * @returns
   */
  public static get(
    id: string,
    opts: PriceUpdatesCacheOptions,
  ): PriceUpdatesCache {
    const key = `${id}:${opts.historical ? "historical" : "latest"}:${opts.ttl}`;
    const cache = PriceUpdatesCache.#caches.get(key);
    if (cache) {
      return cache;
    }
    const newCache = new PriceUpdatesCache(opts);
    PriceUpdatesCache.#caches.set(key, newCache);
    return newCache;
  }

  #cache = new Map<string, Omit<TimestampedCalldata, "cached">>();
  #ttlMs: number;
  #historical: boolean;

  private constructor(opts: PriceUpdatesCacheOptions) {
    this.#ttlMs = opts.ttl;
    this.#historical = opts.historical;
  }

  public get(
    ...path: Array<number | string>
  ): Omit<TimestampedCalldata, "cached"> | undefined {
    const key = this.#cacheKey(...path);
    const data = this.#cache.get(key);
    if (!data) {
      return undefined;
    }
    if (this.#expired(data)) {
      this.#cache.delete(key);
      return undefined;
    }
    return data;
  }

  public set(
    value: Omit<TimestampedCalldata, "cached">,
    ...path: Array<number | string>
  ): void {
    const key = this.#cacheKey(...path);
    this.#cache.set(key, value);
  }

  #expired(value: Omit<TimestampedCalldata, "cached">): boolean {
    if (this.#historical) {
      return false;
    }
    return value.timestamp * 1000 + this.#ttlMs < Date.now();
  }

  #cacheKey(...path: Array<number | string>): string {
    // return `${dataServiceId}:${dataFeedId}:${uniqueSignersCount}`;
    return path.join(":");
  }
}
