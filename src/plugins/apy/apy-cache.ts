import axios from "axios";

import type { Output } from "../../rewards/apy/index.js";
import type { ILogger } from "../../sdk/index.js";

interface CacheEntry {
  data: Output<string, string>;
  etag?: string;
  fetchedAt: number;
}

/**
 * Process-wide cache for the APY state-cache JSON.
 *
 * Multiple ApyPlugin instances (one per SDK / network) share the same
 * cached HTTP response so that only **one** request is made per TTL window
 * regardless of how many SDK instances exist.
 *
 * Concurrent callers that arrive while a fetch is already in flight
 * are de-duplicated — they all await the same promise.
 */
export class ApyOutputCache {
  static #instances = new Map<string, ApyOutputCache>();

  #url: string;
  #ttlMs: number;
  #cache?: CacheEntry;
  #pending?: Promise<Output<string, string> | undefined>;
  #logger?: ILogger;

  private constructor(url: string, ttlMs: number, logger?: ILogger) {
    this.#url = url;
    this.#ttlMs = ttlMs;
    this.#logger = logger;
  }

  /**
   * Returns a shared cache instance for the given URL.
   * The same instance is reused across all callers with identical URL.
   */
  static get(url: string, ttlMs: number, logger?: ILogger): ApyOutputCache {
    let instance = ApyOutputCache.#instances.get(url);
    if (!instance) {
      instance = new ApyOutputCache(url, ttlMs, logger);
      ApyOutputCache.#instances.set(url, instance);
    }
    if (logger) {
      instance.#logger = logger;
    }
    return instance;
  }

  /**
   * Returns cached Output if fresh, otherwise fetches from the network.
   * Concurrent calls are de-duplicated.
   */
  async fetch(): Promise<Output<string, string> | undefined> {
    if (this.#cache && Date.now() - this.#cache.fetchedAt < this.#ttlMs) {
      this.#logger?.debug("apy cache: TTL still valid, returning cached data");
      return this.#cache.data;
    }

    if (this.#pending) {
      this.#logger?.debug("apy cache: request in flight, waiting");
      return this.#pending;
    }

    this.#pending = this.#doFetch();
    try {
      return await this.#pending;
    } finally {
      this.#pending = undefined;
    }
  }

  async #doFetch(): Promise<Output<string, string> | undefined> {
    try {
      const headers: Record<string, string> = {};
      if (this.#cache?.etag) {
        headers["If-None-Match"] = this.#cache.etag;
      }

      const response = await axios.get<Output<string, string>>(this.#url, {
        headers,
        validateStatus: status => status === 200 || status === 304,
      });

      if (response.status === 304 && this.#cache) {
        this.#cache.fetchedAt = Date.now();
        this.#logger?.debug("apy cache: 304 Not Modified, extended TTL");
        return this.#cache.data;
      }

      const etag = response.headers["etag"] as string | undefined;
      this.#cache = {
        data: response.data,
        etag,
        fetchedAt: Date.now(),
      };

      this.#logger?.debug(
        `apy cache: fetched fresh data (timestamp: ${response.data.timestamp})`,
      );
      return response.data;
    } catch (e) {
      this.#logger?.error(e, "apy cache: fetch failed");
      return this.#cache?.data;
    }
  }

  /** Evicts all cached entries. Mainly useful for tests. */
  static clearAll(): void {
    ApyOutputCache.#instances.clear();
  }
}
