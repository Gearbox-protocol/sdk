import type { PoolConfigPayload } from "../../common-utils/static/pool-config.js";
import type { StrategyConfigPayload } from "../../common-utils/static/strategy.js";
import type { ConfigSource } from "./types.js";

export interface CustomConfigSourceOptions {
  getPools: () => Promise<PoolConfigPayload[]>;
  getStrategies: () => Promise<StrategyConfigPayload[]>;
}

export class CustomConfigSource implements ConfigSource {
  #getPools: () => Promise<PoolConfigPayload[]>;
  #getStrategies: () => Promise<StrategyConfigPayload[]>;

  constructor(options: CustomConfigSourceOptions) {
    this.#getPools = options.getPools;
    this.#getStrategies = options.getStrategies;
  }

  public async getPools(): Promise<PoolConfigPayload[]> {
    return this.#getPools();
  }

  public async getStrategies(): Promise<StrategyConfigPayload[]> {
    return this.#getStrategies();
  }
}
