import type { BaseState, IBaseContract } from "../base/index.js";
import type { OnchainSDK } from "../OnchainSDK.js";

/**
 * Serialisable snapshot of a plugin's state, used for hydration.
 *
 * When `loaded` is `false` only the `version` field is present;
 * when `loaded` is `true` the full `State` payload is included.
 *
 * @typeParam State - Plugin-specific state shape.
 **/
export type IPluginState<State extends Record<keyof State, unknown> = {}> = {
  version: number;
} & ({ loaded: false } | ({ loaded: true } & State));

/**
 * @internal
 * Constructor signature that the SDK uses to instantiate a plugin.
 *
 * @typeParam TState  - Plugin-specific state shape.
 * @typeParam TPlugin - Concrete plugin type produced by the constructor.
 **/
export type IOnchainSDKPluginConstructor<
  TState extends Record<keyof TState, unknown>,
  TPlugin extends IOnchainSDKPlugin<TState>,
> = new (sdk: OnchainSDK<any>) => TPlugin;

/**
 * Public contract every SDK plugin must satisfy.
 *
 * Plugins extend the SDK with domain-specific data and behaviour
 * (e.g. farming rewards, zapper helpers). They participate in the
 * SDK lifecycle: attach, hydrate, sync, and on-demand load.
 *
 * @typeParam TState - Plugin-specific state shape.
 **/
export interface IOnchainSDKPlugin<
  TState extends Record<keyof TState, unknown> = {},
> {
  /**
   * Reference to the parent SDK instance.
   * Set automatically by the SDK constructor.
   **/
  sdk: OnchainSDK<any>;
  /**
   * Plugin version, used to verify state compatibility during hydration.
   **/
  version: number;
  /**
   * Whether the plugin's state is ready to use.
   * `true` regardless of how the state was obtained (attach, hydrate, or on-demand load).
   **/
  loaded: boolean;
  /**
   * Plugin state, can be hydrated later.
   **/
  state: TState;
  /**
   * Loads state on demand.
   * If already loaded, returns the existing state unless `force` is `true`.
   *
   * @param force - Re-fetch even if state is already loaded.
   * @returns The loaded plugin state.
   **/
  load?: (force?: boolean) => Promise<TState>;
  /**
   * Called after SDK is attached to the chain.
   * Plugins are not required to implement this — a plugin can be stateless
   * or load state on demand only.
   **/
  attach?: () => Promise<void>;
  /**
   * Restores plugin state from a previously saved snapshot.
   *
   * @param state - state to restore from.
   **/
  hydrate?: (state: TState) => void;
  /**
   * Hook to sync plugin state after sdk state is synced.
   * Called after SDK state is already synced, meaning that block number
   * and timestamp are accessible from the SDK.
   **/
  syncState?: () => Promise<void>;
  /**
   * Factory hook called by the SDK to create auxiliary contracts
   * (e.g. zappers, adapters). If not implemented, the SDK falls back to
   * generic {@link BaseContract} instances.
   *
   * @param params - On-chain identification parameters for the contract.
   * @returns A contract instance, or `undefined` to let the SDK use the default.
   **/
  createContract?: (params: BaseState) => IBaseContract | undefined;
  /**
   * Human-readable state snapshot for diagnostics.
   *
   * @param raw - When `true`, include raw numeric values alongside formatted ones
   *   (e.g. `1 ETH (1000000000000000000)`).
   * @returns An untyped object suitable for logging or inspection.
   **/
  stateHuman?: (raw?: boolean) => unknown;
}

/**
 * Helper type that extracts the state type from a plugin instance.
 **/
export type PluginState<T> =
  T extends IOnchainSDKPlugin<infer TState> ? IPluginState<TState> : never;

/**
 * @internal
 * Mapping between plugin name and plugin instance.
 **/
export type PluginsMap = Record<string, IOnchainSDKPlugin<any>>;

/**
 * @internal
 * Mapping that infers plugin states from plugin instances.
 **/
export type PluginStatesMap<T extends PluginsMap> = {
  [K in keyof T]: PluginState<T[K]>;
};

/**
 * Factory function that produces a plugin instance.
 **/
export type PluginFactory<P extends IOnchainSDKPlugin> = () => P;

/**
 * Map of plugin factories keyed by plugin name.
 **/
export type PluginFactoriesMap<Plugins extends PluginsMap> = {
  [K in keyof Plugins]: PluginFactory<Plugins[K]>;
};
