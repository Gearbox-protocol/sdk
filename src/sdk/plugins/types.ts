import type { BaseState, IBaseContract } from "../base/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";

export type IGearboxSDKPluginConstructor<
  TState,
  TPlugin extends IGearboxSDKPlugin<TState>,
> = new (sdk: GearboxSDK<any>) => TPlugin;

export interface IGearboxSDKPlugin<TState> {
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
 * Type that maps plugin constructor to its state type
 */
export type PluginState<T> =
  T extends IGearboxSDKPlugin<infer TState> ? TState : never;

/**
 * Type that maps a record of plugin constructors to their corresponding instances
 */
export type PluginsMap = Record<string, IGearboxSDKPlugin<any>>;

/**
 * Type that maps a record of plugin constructors to their corresponding states
 */
export type PluginStatesMap<T extends PluginsMap> = {
  [K in keyof T]: PluginState<T[K]>;
};

// create type that creates a map of plugin constructors from PluginsMap
export type PluginConstructorMap<T extends PluginsMap> = {
  [K in keyof T]: T[K] extends IGearboxSDKPlugin<infer TState>
    ? IGearboxSDKPluginConstructor<TState, T[K]>
    : never;
};
