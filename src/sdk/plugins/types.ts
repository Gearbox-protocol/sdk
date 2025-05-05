import type { BaseState, IBaseContract } from "../base/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";

export interface IPluginState {
  version: number;
}

export type IGearboxSDKPluginConstructor<
  TState extends IPluginState | undefined,
  TPlugin extends IGearboxSDKPlugin<TState>,
> = new (sdk: GearboxSDK<any>) => TPlugin;

export interface IGearboxSDKPlugin<TState extends IPluginState | undefined> {
  /**
   * Plugin version, used to check if the plugin state is compatible with the plugin during hydration
   */
  version: number;
  /**
   * Called after SDK is attached
   * @param sdk
   * @returns
   */
  attach?: () => Promise<void>;
  /**
   * Called after SDK state is already synced, meaning that block number and timestamp are accessible from SDK
   *
   * @param sdk
   * @returns
   */
  syncState?: () => Promise<void>;
  /**
   * Can be called by SDK to create some auxiliary contracts, such as zappers and adapters
   * @param params
   * @returns
   */
  createContract?: (params: BaseState) => IBaseContract | undefined;
  /**
   * Human readable state for diagnostics
   * @param raw (print actual values in addition to human-friendly values, e.g. 1 ETH (1000000000000000000))
   * @returns
   */
  stateHuman?: (raw?: boolean) => unknown;
  /**
   * Plugin state, can be hydarted/dehydrated
   */
  state: TState;
  /**
   * Loads plugin state from dehydrated state
   * @param state
   * @returns
   */
  hydrate?: (state: TState) => void;
}

/**
 * Helper type that extracts the state type from a plugin instance
 */
export type PluginState<T> =
  T extends IGearboxSDKPlugin<infer TState> ? TState : never;

/**
 * Mapping between plugin name and plugin instance
 */
export type PluginsMap = Record<string, IGearboxSDKPlugin<any>>;

/**
 * Mapping that infers plugin states map from plugin instances map
 */
export type PluginStatesMap<T extends PluginsMap> = {
  [K in keyof T]: PluginState<T[K]>;
};

/**
 * Mapping that infers plugin constructor map from plugin instances map
 */
export type PluginConstructorMap<T extends PluginsMap> = {
  [K in keyof T]: T[K] extends IGearboxSDKPlugin<infer TState>
    ? IGearboxSDKPluginConstructor<TState, T[K]>
    : never;
};
