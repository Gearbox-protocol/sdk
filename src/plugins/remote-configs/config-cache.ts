import axios from "axios";

import type { ILogger } from "../../sdk/index.js";

interface CacheEntry<T> {
  data: T;
  etag?: string;
  fetchedAt: number;
}

/**
 * Process-wide cache for raw config JSON responses.
 *
 * Multiple RemoteConfigsPlugin instances (one per SDK / network) share the same
 * cached HTTP response so that only **one** request is made per TTL window
 * regardless of how many SDK instances exist.
 *
 * Concurrent callers that arrive while a fetch is already in flight
 * are de-duplicated — they all await the same promise.
 */
export class ConfigCache<T> {
  static #instances = new Map<string, ConfigCache<unknown>>();

  #url: string;
  #ttlMs: number;
  #cache?: CacheEntry<T>;
  #pending?: Promise<T>;
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
  static get<T>(url: string, ttlMs: number, logger?: ILogger): ConfigCache<T> {
    let instance = ConfigCache.#instances.get(url);
    if (!instance) {
      instance = new ConfigCache<T>(url, ttlMs, logger);
      ConfigCache.#instances.set(url, instance as ConfigCache<unknown>);
    }
    if (logger) {
      instance.#logger = logger;
    }
    return instance as ConfigCache<T>;
  }

  /**
   * Returns cached data if fresh, otherwise fetches from the network.
   * Concurrent calls are de-duplicated.
   */
  async fetch(): Promise<T> {
    if (this.#cache && Date.now() - this.#cache.fetchedAt < this.#ttlMs) {
      this.#logger?.debug(
        "config cache: TTL still valid, returning cached data",
      );
      return this.#cache.data;
    }

    if (this.#pending) {
      this.#logger?.debug("config cache: request in flight, waiting");
      return this.#pending;
    }

    this.#pending = this.#doFetch();
    try {
      return await this.#pending;
    } finally {
      this.#pending = undefined;
    }
  }

  async #doFetch(): Promise<T> {
    try {
      const headers: Record<string, string> = {};
      if (this.#cache?.etag) {
        headers["If-None-Match"] = this.#cache.etag;
      }

      const response = await axios.get<T>(this.#url, {
        headers,
        validateStatus: status => status === 200 || status === 304,
      });

      if (response.status === 304 && this.#cache) {
        this.#cache.fetchedAt = Date.now();
        this.#logger?.debug("config cache: 304 Not Modified, extended TTL");
        return this.#cache.data;
      }

      const etag = response.headers.etag as string | undefined;
      this.#cache = {
        data: response.data,
        etag,
        fetchedAt: Date.now(),
      };

      this.#logger?.debug("config cache: fetched fresh data");
      return response.data;
    } catch (e) {
      this.#logger?.error(e, "config cache: fetch failed");
      if (this.#cache) {
        return this.#cache.data;
      }
      throw e;
    }
  }

  /** Evicts all cached entries. Mainly useful for tests. */
  static clearAll(): void {
    ConfigCache.#instances.clear();
  }
}
