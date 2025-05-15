export interface TimestampedCalldata {
  dataFeedId: string;
  data: `0x${string}`;
  /**
   * This timestamp is in seconds
   */
  timestamp: number;
  cached: boolean;
}

export interface RedstoneCacheOptions {
  /**
   * Assume that in historical mode we only need to fetch once and then reuse from cache forever
   */
  historical: boolean;
  /**
   * TTL in milliseconds
   */
  ttl: number;
}

export class RedstoneCache {
  #cache = new Map<string, Omit<TimestampedCalldata, "cached">>();
  #ttlMs: number;
  #historical: boolean;

  constructor(opts: RedstoneCacheOptions) {
    this.#ttlMs = opts.ttl;
    this.#historical = opts.historical;
  }

  public get(
    dataServiceId: string,
    dataFeedId: string,
    uniqueSignersCount: number,
  ): Omit<TimestampedCalldata, "cached"> | undefined {
    const key = this.#cacheKey(dataServiceId, dataFeedId, uniqueSignersCount);
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
    dataServiceId: string,
    dataFeedId: string,
    uniqueSignersCount: number,
    value: Omit<TimestampedCalldata, "cached">,
  ): void {
    const key = this.#cacheKey(dataServiceId, dataFeedId, uniqueSignersCount);
    this.#cache.set(key, value);
  }

  #expired(value: Omit<TimestampedCalldata, "cached">): boolean {
    if (this.#historical) {
      return false;
    }
    return value.timestamp * 1000 + this.#ttlMs < Date.now();
  }

  #cacheKey(
    dataServiceId: string,
    dataFeedId: string,
    uniqueSignersCount: number,
  ): string {
    return `${dataServiceId}:${dataFeedId}:${uniqueSignersCount}`;
  }
}
