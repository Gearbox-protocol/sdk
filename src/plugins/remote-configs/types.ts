import type { PoolConfigPayload } from "../../common-utils/static/pool-config.js";
import type { StrategyConfigPayload } from "../../common-utils/static/strategy.js";
import type { NotValidatedStrategy } from "../../common-utils/utils/strategies/types/strategy.js";

export interface RemoteConfigsPluginState {
  pools: PoolConfigPayload[];
  strategies: NotValidatedStrategy[];
}

/**
 * Abstraction for a config provider.
 * Multiple sources can be composed; the plugin tries them in order
 * until one succeeds.
 */
export interface ConfigSource {
  getPools(): Promise<PoolConfigPayload[]>;
  getStrategies(): Promise<StrategyConfigPayload[]>;
}

export interface RemoteConfigsPluginOptions {
  /**
   * Ordered list of config sources.
   * Defaults to `[new RemoteConfigSource()]` if omitted.
   */
  sources?: ConfigSource[];
}

export type { NotValidatedStrategy, PoolConfigPayload, StrategyConfigPayload };
