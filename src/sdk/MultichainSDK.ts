import type { NetworkType } from "./chain/chains.js";
import { getNetworkType } from "./chain/chains.js";
import {
  SdkMissingChainStateError,
  SdkStateVersionMismatchError,
  SdkSyncFailedError,
} from "./core/index.js";
import {
  PriceUpdatesCache,
  type PythOptions,
  type RedstoneOptions,
} from "./market/pricefeeds/updates/index.js";
import {
  type AttachOptions,
  type ClientOptions,
  type HydrateOptions,
  OnchainSDK,
  type OnchainSDKOptions,
  STATE_VERSION,
} from "./OnchainSDK.js";
import type { PluginFactoriesMap, PluginsMap } from "./plugins/index.js";
import type {
  ILogger,
  MultichainState,
  MultichainStateHuman,
} from "./types/index.js";

/**
 * Per-chain configuration for {@link MultichainSDK}.
 **/
export interface ChainConfig {
  /**
   * Gas limit for read-only `eth_call` requests. `null` disables, `undefined` uses default.
   **/
  gasLimit?: bigint | null;
}

/**
 * Options for creating a {@link MultichainSDK} instance.
 *
 * @typeParam Plugins - Map of plugin names to plugin instances.
 **/
export interface MultichainSDKOptions<Plugins extends PluginsMap> {
  /**
   * Per-chain client and configuration.
   **/
  chains: Partial<Record<NetworkType, ChainConfig & ClientOptions>>;
  /**
   * Plugin factories — called once per chain to produce independent instances.
   **/
  plugins?: PluginFactoriesMap<Plugins>;
  /**
   * Shared default logger
   **/
  logger?: ILogger;
  /**
   * When `true`, throw on unrecognised contract types instead of falling back to a generic contract wrapper.
   **/
  strictContractTypes?: boolean;
  /**
   * Default gas limit for read-only `eth_call` requests on all chains. `null` disables, `undefined` uses default.
   **/
  gasLimit?: bigint | null;
}

/**
 * Options for {@link MultichainSDK.attach}.
 **/
export interface MultichainAttachOptions {
  /**
   * Per-chain attach options.
   **/
  perChain?: Partial<Record<NetworkType, AttachOptions>>;
  /**
   * Options for Redstone price-feed updates (shared cache across chains).
   **/
  redstone?: RedstoneOptions;
  /**
   * Options for Pyth price-feed updates (shared cache across chains).
   **/
  pyth?: PythOptions;
}

/**
 * Options for {@link MultichainSDK.hydrate}.
 **/
export interface MultichainHydrateOptions {
  /**
   * Per-chain hydrate options.
   **/
  perChain?: Partial<Record<NetworkType, HydrateOptions>>;
  /**
   * Options for Redstone price-feed updates (shared cache across chains).
   **/
  redstone?: RedstoneOptions;
  /**
   * Options for Pyth price-feed updates (shared cache across chains).
   **/
  pyth?: PythOptions;
}

/**
 * Options for {@link MultichainSDK.syncState}.
 **/
export interface MultichainSyncStateOptions {
  /**
   * When `true`, skip refreshing updatable price feeds.
   **/
  ignoreUpdateablePrices?: boolean;
}

/**
 * Thin wrapper around multiple {@link OnchainSDK} instances, one per chain.
 *
 * @typeParam Plugins - Map of plugin names to plugin instances.
 **/
export class MultichainSDK<const Plugins extends PluginsMap = {}> {
  readonly #chains: Map<NetworkType, OnchainSDK<Plugins>>;
  #redstoneCache?: PriceUpdatesCache;
  #pythCache?: PriceUpdatesCache;

  constructor(options: MultichainSDKOptions<Plugins>) {
    this.#chains = new Map();

    for (const [network, chainConfig] of Object.entries(options.chains)) {
      const { gasLimit, ...clientOptions } = chainConfig;

      let plugins: Plugins | undefined;
      if (options.plugins) {
        plugins = Object.fromEntries(
          Object.entries(options.plugins).map(([name, factory]) => [
            name,
            factory(),
          ]),
        ) as unknown as Plugins;
      }

      const sdkOptions: OnchainSDKOptions<Plugins> = {
        logger: options.logger?.child?.({ network }),
        strictContractTypes: options.strictContractTypes,
        gasLimit: gasLimit ?? options.gasLimit,
        plugins,
      };

      const sdk = new OnchainSDK<Plugins>(
        network as NetworkType,
        clientOptions as ClientOptions,
        sdkOptions,
      );
      this.#chains.set(network as NetworkType, sdk);
    }
  }

  /**
   * Attach all configured chains in parallel.
   *
   * @param options - Shared and per-chain attach options.
   */
  public async attach(options?: MultichainAttachOptions): Promise<void> {
    if (options?.redstone) {
      this.#redstoneCache = new PriceUpdatesCache({
        ttl: options.redstone.cacheTTL ?? 225_000,
        historical: !!options.redstone.historicTimestamp,
      });
    }
    if (options?.pyth) {
      this.#pythCache = new PriceUpdatesCache({
        ttl: options.pyth.cacheTTL ?? 225_000,
        historical: !!options.pyth.historicTimestamp,
      });
    }

    await Promise.all(
      [...this.#chains.entries()].map(([network, sdk]) => {
        const perChainOpts = options?.perChain?.[network] ?? {};
        return sdk.attach({
          ...perChainOpts,
          redstone: {
            ...options?.redstone,
            cache: this.#redstoneCache,
            ...perChainOpts.redstone,
          },
          pyth: {
            ...options?.pyth,
            cache: this.#pythCache,
            ...perChainOpts.pyth,
          },
        });
      }),
    );
  }

  /**
   * Hydrate all configured chains from serialised state.
   *
   * @param state - Multichain serialised state.
   * @param options - Shared and per-chain hydrate options.
   * @throws {@link SdkStateVersionMismatchError} if version doesn't match.
   * @throws {@link SdkMissingChainStateError} if a configured chain has no state.
   */
  public hydrate(
    state: MultichainState<Plugins>,
    options?: MultichainHydrateOptions,
  ): void {
    if (state.version !== STATE_VERSION) {
      throw new SdkStateVersionMismatchError(STATE_VERSION, state.version);
    }

    if (options?.redstone) {
      this.#redstoneCache = new PriceUpdatesCache({
        ttl: options.redstone.cacheTTL ?? 225_000,
        historical: !!options.redstone.historicTimestamp,
      });
    }
    if (options?.pyth) {
      this.#pythCache = new PriceUpdatesCache({
        ttl: options.pyth.cacheTTL ?? 225_000,
        historical: !!options.pyth.historicTimestamp,
      });
    }

    const stateByNetwork = new Map(state.chains.map(cs => [cs.network, cs]));

    for (const [network, sdk] of this.#chains) {
      const chainState = stateByNetwork.get(network);
      if (!chainState) {
        throw new SdkMissingChainStateError(network);
      }
      const perChainOpts = options?.perChain?.[network] ?? {};
      sdk.hydrate(chainState, {
        ...perChainOpts,
        redstone: {
          ...options?.redstone,
          cache: this.#redstoneCache,
          ...perChainOpts.redstone,
        },
        pyth: {
          ...options?.pyth,
          cache: this.#pythCache,
          ...perChainOpts.pyth,
        },
      });
    }
  }

  /**
   * Returns the {@link OnchainSDK} for a given network or chain ID.
   *
   * @param networkOrChainId - Network type string or numeric chain ID.
   * @throws If the network/chain is not configured.
   */
  public chain(networkOrChainId: NetworkType | number): OnchainSDK<Plugins> {
    let network: NetworkType;
    if (typeof networkOrChainId === "number") {
      network = getNetworkType(networkOrChainId);
    } else {
      network = networkOrChainId;
    }
    const sdk = this.#chains.get(network);
    if (!sdk) {
      throw new Error(
        `Chain ${String(networkOrChainId)} is not configured in this MultichainSDK`,
      );
    }
    return sdk;
  }

  /**
   * Read-only map of all configured chains.
   **/
  public get chains(): ReadonlyMap<NetworkType, OnchainSDK<Plugins>> {
    return this.#chains;
  }

  /**
   * Sync state for all chains in parallel.
   *
   * @param opts - Sync options.
   * @throws {@link SdkSyncFailedError} if any chain fails.
   */
  public async syncState(opts?: MultichainSyncStateOptions): Promise<void> {
    const errors: Partial<Record<NetworkType, unknown>> = {};
    const results = await Promise.allSettled(
      [...this.#chains.entries()].map(async ([_network, sdk]) => {
        const block = await sdk.client.getBlock({ blockTag: "latest" });
        const synced = await sdk.syncState({
          blockNumber: block.number,
          timestamp: block.timestamp,
          ignoreUpdateablePrices: opts?.ignoreUpdateablePrices,
        });
        if (!synced) {
          return;
        }
      }),
    );

    for (const [i, result] of results.entries()) {
      if (result.status === "rejected") {
        const network = [...this.#chains.keys()][i];
        errors[network] = result.reason;
      }
    }

    if (Object.keys(errors).length > 0) {
      throw new SdkSyncFailedError(errors);
    }
  }

  /**
   * Serialisable snapshot of all chains' state.
   **/
  public get state(): MultichainState<Plugins> {
    return {
      version: STATE_VERSION,
      chains: [...this.#chains.values()].map(sdk => sdk.state),
    };
  }

  /**
   * Human-readable snapshot of all chains' state.
   * @param raw - When `true`, include raw numeric values.
   */
  public stateHuman(raw?: boolean): MultichainStateHuman {
    return {
      version: STATE_VERSION,
      chains: [...this.#chains.values()].map(sdk => sdk.stateHuman(raw)),
    };
  }
}
