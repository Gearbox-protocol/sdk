import axios from "axios";

import type { PoolConfigPayload } from "../../common-utils/static/pool-config.js";
import type { StrategyConfigPayload } from "../../common-utils/static/strategy.js";
import type { ConfigSource } from "./types.js";

const DEFAULT_POOLS_URL =
  "https://static.gearbox.finance/client-v3/configs/pools/pools.json";
const DEFAULT_STRATEGIES_URL =
  "https://static.gearbox.finance/client-v3/configs/strategies/strategies.json";

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
}

export class RemoteConfigSource implements ConfigSource {
  #poolsUrl: string;
  #strategiesUrl: string;

  constructor(options?: RemoteConfigSourceOptions) {
    this.#poolsUrl = options?.poolsUrl ?? DEFAULT_POOLS_URL;
    this.#strategiesUrl = options?.strategiesUrl ?? DEFAULT_STRATEGIES_URL;
  }

  public async getPools(): Promise<PoolConfigPayload[]> {
    const { data } = await axios.get<Array<PoolConfigPayload>>(this.#poolsUrl);
    return data || [];
  }

  public async getStrategies(): Promise<StrategyConfigPayload[]> {
    const { data } = await axios.get<Array<StrategyConfigPayload>>(
      this.#strategiesUrl,
    );
    return data || [];
  }
}
