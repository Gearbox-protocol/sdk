import { AxiosCache } from "../../common-utils/axios-cache/index.js";
import type { PoolConfigPayload } from "../../common-utils/static/pool-config.js";
import type { StrategyConfigPayload } from "../../common-utils/static/strategy.js";
import type { ILogger } from "../../sdk/index.js";
import type { ConfigSource } from "./types.js";

const DEFAULT_POOLS_URL =
  "https://static.gearbox.finance/client-v3/configs/pools/pools.json";
const DEFAULT_STRATEGIES_URL =
  "https://static.gearbox.finance/client-v3/configs/strategies/strategies.json";
const DEFAULT_CACHE_TTL_MS = 30 * 60 * 1000;

export interface RemoteConfigSourceOptions {
  /**
   * URL for pools config JSON.
   * @default "https://static.gearbox.finance/client-v3/configs/pools/pools.json"
   */
  poolsUrl?: string;
  /**
   * URL for strategies config JSON.
   * @default "https://static.gearbox.finance/client-v3/configs/strategies/strategies.json"
   */
  strategiesUrl?: string;
  /**
   * Cache TTL in milliseconds.
   * @default 60_000
   */
  cacheTtlMs?: number;
  /**
   * Optional logger for cache diagnostics.
   */
  logger?: ILogger;
}

export class RemoteConfigSource implements ConfigSource {
  #poolsCache: AxiosCache<Array<PoolConfigPayload>>;
  #strategiesCache: AxiosCache<Array<StrategyConfigPayload>>;

  constructor(options?: RemoteConfigSourceOptions) {
    const poolsUrl = options?.poolsUrl ?? DEFAULT_POOLS_URL;
    const strategiesUrl = options?.strategiesUrl ?? DEFAULT_STRATEGIES_URL;
    const ttlMs = options?.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;

    this.#poolsCache = AxiosCache.get<Array<PoolConfigPayload>>(
      poolsUrl,
      ttlMs,
      options?.logger,
    );
    this.#strategiesCache = AxiosCache.get<Array<StrategyConfigPayload>>(
      strategiesUrl,
      ttlMs,
      options?.logger,
    );
  }

  public async getPools(): Promise<Array<PoolConfigPayload>> {
    return this.#poolsCache.fetch();
  }

  public async getStrategies(): Promise<Array<StrategyConfigPayload>> {
    return this.#strategiesCache.fetch();
  }
}
