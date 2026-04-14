import type { Address } from "viem";
import {
  createPublicClient,
  defineChain,
  fallback,
  http,
  type PublicClient,
  parseEventLogs,
  type Transport,
} from "viem";
import type { HttpRpcClientOptions } from "viem/utils";
import type { BaseState, IBaseContract } from "./base/index.js";
import { ChainContractsRegister } from "./base/index.js";
import type { GearboxChain, NetworkType } from "./chain/chains.js";
import { detectNetwork, getChain } from "./chain/index.js";
import type { VersionRange } from "./constants/index.js";
import {
  ADDRESS_PROVIDER_V310,
  AP_GEAR_TOKEN,
  AP_ROUTER,
  isV310,
  NO_VERSION,
  VERSION_RANGE_310,
} from "./constants/index.js";
import type { IAddressProviderContract } from "./core/index.js";
import { createAddressProvider, hydrateAddressProvider } from "./core/index.js";
import { MarketRegister } from "./market/MarketRegister.js";
import { PriceFeedRegister } from "./market/pricefeeds/index.js";
import type { SDKOptions } from "./options.js";
import {
  type PluginStatesMap,
  PluginStateVersionError,
  type PluginsMap,
} from "./plugins/index.js";
import { createRouter, type IRouterContract } from "./router/index.js";
import type { GearboxState, GearboxStateHuman } from "./types/index.js";
import type { PickSomeRequired } from "./utils/index.js";
import { formatTimestamp, TypedObjectUtils, toAddress } from "./utils/index.js";
import { Hooks } from "./utils/internal/index.js";
import { getLogsSafe } from "./utils/viem/index.js";

const ERR_NOT_ATTACHED = new Error("Gearbox SDK not attached");

/**
 * Serialised state format version, checked during hydration to detect
 * incompatible snapshots.
 **/
export const STATE_VERSION = 1;

/**
 * Explicit network identity, required when working with forked testnets
 * whose chain IDs differ from the canonical mainnet/testnet values.
 **/
export interface NetworkOptions {
  /**
   * EVM chain ID.
   * Must be set explicitly for forked testnets whose chain ID differs
   * from the canonical network.
   **/
  chainId: number;
  /**
   * Gearbox network type (e.g. `"Mainnet"`, `"Arbitrum"`).
   * Must be set explicitly for forked testnets whose chain ID differs
   * from the canonical network.
   **/
  networkType: NetworkType;
}

/**
 * Connection options for the underlying JSON-RPC provider.
 *
 * Supply **one** of the three variants:
 * - `rpcURLs` — the SDK creates a viem transport internally (with optional
 *    fallback when multiple URLs are given).
 * - `transport` — bring your own viem `Transport`.
 * - `client` — bring your own fully-configured viem `PublicClient`.
 *    When using this variant, the client is responsible for carrying the
 *    correct `networkType` and `chainId`.
 *
 * ### Network detection
 *
 * For the `rpcURLs` and `transport` variants, `networkType` and `chainId` are
 * resolved as follows (see {@link NetworkOptions}):
 * - If `networkType` is provided, it is used directly; `chainId` defaults to
 *   the canonical chain ID for that network when omitted.
 * - If `networkType` is **not** provided, it is detected automatically using {@link detectNetwork}.
 *   When `chainId` is also omitted it is fetched via `eth_chainId`.
 *
 **/
export type ClientOptions =
  | {
      /**
       * One or more JSON-RPC endpoint URLs.
       * When more than one URL is provided, a viem `fallback` transport is created.
       **/
      rpcURLs: string[];
      /**
       * Per-request timeout in milliseconds.
       **/
      timeout?: number;
      /**
       * Number of automatic retries per RPC call.
       **/
      retryCount?: number;
      /**
       * Low-level options forwarded to the viem HTTP transport.
       **/
      httpTransportOptions?: HttpRpcClientOptions | undefined;
    }
  | {
      /**
       * Pre-built viem transport.
       **/
      transport: Transport;
    }
  | {
      /**
       * Pre-built viem public client.
       * Must already carry a {@link GearboxChain} definition with `networkType`
       * and `chainId`.
       **/
      client: PublicClient<Transport, GearboxChain>;
    };

/**
 * @internal
 * Creates a viem `PublicClient` from the given connection options.
 *
 * @param opts - Connection variant (RPC URLs, transport, or existing client).
 * @param network - When provided, the resulting client is pinned to this
 *   network identity.
 * @returns A viem public client bound to a {@link GearboxChain}.
 **/
function createClient(
  opts: ClientOptions,
  network?: NetworkOptions,
): PublicClient<Transport, GearboxChain> {
  let transport: Transport;
  if ("client" in opts) {
    return opts.client;
  }
  if ("transport" in opts) {
    transport = opts.transport;
  } else {
    const rpcs = opts.rpcURLs.map(url =>
      http(url, {
        ...opts.httpTransportOptions,
        timeout: opts.timeout,
        retryCount: opts.retryCount,
      }),
    );
    transport = rpcs.length > 1 ? fallback(rpcs) : rpcs[0];
  }
  const chain = network
    ? (defineChain({
        ...getChain(network.networkType),
        id: network.chainId,
      }) as GearboxChain)
    : undefined;
  return createPublicClient({ transport, chain });
}

/**
 * @internal
 * Creates a client and auto-detects network type and chain ID when they are
 * not explicitly provided.
 * See {@link detectNetwork} for more details.
 *
 * @param options - Connection variant.
 * @param network - Partial network identity; missing fields are detected from the RPC.
 * @returns A viem public client with full network identity.
 **/
async function attachClient(
  options: ClientOptions,
  network: Partial<NetworkOptions>,
): Promise<PublicClient<Transport, GearboxChain>> {
  let { chainId, networkType } = network;
  const attachClient = createClient(options);
  if (networkType) {
    if (!chainId) {
      chainId = getChain(networkType).id;
    }
  } else {
    networkType = await detectNetwork(attachClient);
    if (!chainId) {
      chainId = await attachClient.getChainId();
    }
  }
  return createClient(options, { networkType, chainId });
}

/**
 * Options accepted by {@link GearboxSDK.hydrate}.
 *
 * Same as {@link SDKOptions} but without fields that are already captured
 * inside the serialised {@link GearboxState} (`blockNumber`,
 * `addressProvider`, `marketConfigurators`).
 *
 * @typeParam Plugins - Map of plugin names to plugin instances.
 **/
export type HydrateOptions<Plugins extends PluginsMap> = Omit<
  SDKOptions<Plugins>,
  "blockNumber" | "addressProvider" | "marketConfigurators"
>;

type SDKContructorArgs<Plugins extends PluginsMap> = Pick<
  SDKOptions<Plugins>,
  "logger" | "strictContractTypes" | "plugins" | "gasLimit"
> & { client: PublicClient<Transport, GearboxChain> };

type AttachOptionsInternal = PickSomeRequired<
  SDKOptions<any>,
  "addressProvider" | "marketConfigurators",
  | "blockNumber"
  | "ignoreUpdateablePrices"
  | "redstone"
  | "pyth"
  | "ignoreMarkets"
  | "gasLimit"
>;

/**
 * Options for {@link GearboxSDK.syncState}, controlling which block to
 * sync to and whether updatable price feeds should be refreshed.
 **/
export interface SyncStateOptions {
  /**
   * Target block number to sync to.
   **/
  blockNumber: bigint;
  /**
   * Block timestamp corresponding to `blockNumber`.
   **/
  timestamp: bigint;
  /**
   * When `true`, skip refreshing updatable price feeds during this sync.
   **/
  ignoreUpdateablePrices?: boolean;
}

/**
 * Payload carried by the `pluginUpdate` hook.
 **/
export interface PluginUpdateInfo {
  /** Identifier of the plugin that triggered the update (e.g. `"pools7DAgo"`). */
  plugin: string;
}

/**
 * Hook event map for the SDK lifecycle.
 *
 * Register listeners via {@link GearboxSDK.addHook} and remove them
 * with {@link GearboxSDK.removeHook}.
 *
 * - `syncState` — fired after {@link GearboxSDK.syncState} completes.
 * - `rehydrate` — fired after {@link GearboxSDK.rehydrate} completes.
 * - `pluginUpdate` — fired by a plugin when its internal state changes
 *   outside of the normal `syncState`/`rehydrate` cycle (e.g. timer tick).
 **/
export type SDKHooks = {
  syncState: [SyncStateOptions];
  rehydrate: [SyncStateOptions];
  pluginUpdate: [PluginUpdateInfo];
};

/**
 * Main entry point for the Gearbox SDK.
 *
 * `GearboxSDK` aggregates on-chain state for the Gearbox protocol — markets,
 * credit managers, pools, price oracles, and price feeds — into a single
 * queryable object that can be kept up-to-date via {@link syncState} or
 * serialised/restored via {@link state}/{@link hydrate}.
 *
 * It represents on-chain state using instances of js classes that provide convenient methods
 * to read state and prepare transactions to interact with the protocol.
 *
 * Create an instance with the static {@link GearboxSDK.attach | attach}
 * (reads live chain data) or {@link GearboxSDK.hydrate | hydrate}
 * (restores from a saved snapshot) factory methods.
 *
 * @typeParam Plugins - Map of plugin names to plugin instances that extend
 *   the SDK with additional domain-specific functionality.
 **/
export class GearboxSDK<
  const Plugins extends PluginsMap = {},
> extends ChainContractsRegister {
  readonly #hooks = new Hooks<SDKHooks>();

  /**
   * Registered plugin instances, keyed by plugin name.
   **/
  readonly plugins: Plugins;

  #currentBlock?: bigint;
  #timestamp?: bigint;
  #syncing = false;

  #addressProvider?: IAddressProviderContract;
  #attachConfig?: AttachOptionsInternal;

  #marketRegister?: MarketRegister;
  #priceFeeds?: PriceFeedRegister;

  /**
   * Gas limit applied to read-only `eth_call` requests.
   * `undefined` means that gas limit will not be set on read-only calls,
   * leaving it to rpc provider to decide.
   **/
  public readonly gasLimit: bigint | undefined;

  /**
   * When `true`, the SDK throws on unrecognised contract types instead of
   * falling back to a generic contract wrapper.
   **/
  public readonly strictContractTypes: boolean;

  /**
   * Registers a callback for an SDK lifecycle event.
   *
   * @see {@link SDKHooks} for available event names.
   **/
  public addHook = this.#hooks.addHook.bind(this.#hooks);

  /**
   * Removes a previously registered lifecycle callback.
   *
   * @see {@link SDKHooks} for available event names.
   **/
  public removeHook = this.#hooks.removeHook.bind(this.#hooks);

  /**
   * Triggers the `pluginUpdate` hook.
   *
   * Intended to be called by plugins when they update their internal state
   * outside of the normal `syncState`/`rehydrate` cycle (e.g. via an
   * internal timer).  Frontend listeners registered with
   * `sdk.addHook("pluginUpdate", …)` will be notified.
   **/
  public async triggerPluginUpdate(plugin: string): Promise<void> {
    await this.#hooks.triggerHooks("pluginUpdate", { plugin });
  }

  /**
   * Creates and initialises a new SDK instance by reading live on-chain state.
   *
   * This is the primary way to bootstrap the SDK.  The method connects to the
   * chain, discovers the address provider and all configured markets, and
   * attaches any supplied plugins.
   *
   * @param options - Combined SDK, client, and (optional) network options.
   * @returns A fully initialised SDK instance.
   **/
  public static async attach<const Plugins extends PluginsMap>(
    options: SDKOptions<Plugins> & ClientOptions & Partial<NetworkOptions>,
  ): Promise<GearboxSDK<Plugins>> {
    const {
      logger,
      plugins,
      blockNumber,
      redstone,
      pyth,
      ignoreUpdateablePrices,
      ignoreMarkets,
      marketConfigurators: mcs,
      strictContractTypes,
      gasLimit,
    } = options;
    let { addressProvider } = options;
    const client = await attachClient(options, options);

    if (!addressProvider) {
      addressProvider = ADDRESS_PROVIDER_V310;
    }
    const marketConfigurators =
      mcs ?? TypedObjectUtils.keys(client.chain.defaultMarketConfigurators);

    return new GearboxSDK<Plugins>({
      client,
      logger,
      plugins,
      strictContractTypes,
      gasLimit,
    }).#attach({
      addressProvider,
      blockNumber,
      ignoreUpdateablePrices,
      ignoreMarkets,
      marketConfigurators,
      redstone,
      pyth,
    });
  }

  /**
   * Creates a new SDK instance from a previously serialised {@link GearboxState}
   * snapshot, without making any on-chain calls.
   *
   * Use this for fast startup when a recent state snapshot is available
   * (e.g. loaded from a file or received from a backend service).
   *
   * @param options - SDK and client options (block number and address provider
   *   are taken from the snapshot).
   * @param state - Serialised state obtained from {@link GearboxSDK.state}.
   * @returns A fully initialised SDK instance.
   * @throws If the snapshot's {@link STATE_VERSION} does not match.
   **/
  public static hydrate<const Plugins extends PluginsMap>(
    options: HydrateOptions<Plugins> & ClientOptions,
    state: GearboxState<Plugins>,
  ): GearboxSDK<Plugins> {
    const { logger, plugins, strictContractTypes, gasLimit, ...rest } = options;
    const client = createClient(options, {
      networkType: state.network,
      chainId: state.chainId,
    });

    return new GearboxSDK({
      client,
      plugins,
      logger,
      strictContractTypes,
      gasLimit,
    }).#hydrate(rest, state);
  }

  private constructor(options: SDKContructorArgs<Plugins>) {
    super(options.client, options.logger);
    this.strictContractTypes = options.strictContractTypes ?? false;
    this.plugins = options.plugins ?? ({} as Plugins);

    for (const plugin of Object.values(this.plugins)) {
      plugin.sdk = this;
    }
    // null to disable explicitly setting gas limit, undefined to use default sdk value
    if (options.gasLimit !== null) {
      this.gasLimit = options.gasLimit || 550_000_000n;
    }
  }

  async #attach(opts: AttachOptionsInternal): Promise<this> {
    const {
      addressProvider,
      blockNumber,
      ignoreUpdateablePrices,
      ignoreMarkets,
      marketConfigurators,
      redstone,
      pyth,
    } = opts;
    const re = this.#attachConfig ? "re" : "";
    this.logger?.info(
      {
        networkType: this.networkType,
        chainId: this.chainId,
        addressProvider,
        marketConfigurators,
        blockNumber,
        ignoreMarkets,
      },
      `${re}attaching gearbox sdk`,
    );
    if (!!blockNumber && !opts.redstone?.historicTimestamp) {
      this.logger?.warn(
        `${re}attaching to fixed block number, but redstone historicTimestamp is not set. price updates might fail`,
      );
    }
    if (!!blockNumber && !opts.pyth?.historicTimestamp) {
      this.logger?.warn(
        `${re}attaching to fixed block number, but pyth historicTimestamp is not set. price updates might fail`,
      );
    }
    this.#attachConfig = opts;
    const time = Date.now();
    const block = await this.client.getBlock(
      blockNumber
        ? { blockNumber: BigInt(blockNumber) }
        : {
            blockTag: "latest",
          },
    );
    this.#currentBlock = block.number;
    this.#timestamp = block.timestamp;

    this.#priceFeeds = new PriceFeedRegister(this, { redstone, pyth });

    this.logger?.debug(
      `${re}attach block number ${this.currentBlock} timestamp ${this.timestamp}`,
    );
    this.#addressProvider = await createAddressProvider(this, addressProvider);
    this.logger?.debug(
      `address provider version: ${this.#addressProvider.version}`,
    );
    await this.#addressProvider.syncState(this.currentBlock);

    this.#marketRegister = new MarketRegister(this, ignoreMarkets);
    await this.#marketRegister.loadMarkets(
      marketConfigurators,
      ignoreUpdateablePrices,
    );

    const pluginsList = TypedObjectUtils.entries(this.plugins);
    const pluginResponse = await Promise.allSettled(
      pluginsList.map(([name, plugin]) => {
        if (plugin.attach) {
          this.logger?.debug(`${re}attaching plugin ${name}`);
          return plugin.attach();
        }
        return undefined;
      }),
    );

    pluginResponse.forEach((r, i) => {
      const [name, plugin] = pluginsList[i];

      if (plugin.attach && r.status === "fulfilled") {
        this.logger?.debug(`${re}attached plugin ${name}`);
      } else if (plugin.attach && r.status === "rejected") {
        this.logger?.error(r.reason, `failed to ${re}attach plugin ${name}`);
      }
    });

    this.logger?.info(`${re}attach time: ${Date.now() - time} ms`);

    return this;
  }

  #hydrate(
    options: Omit<HydrateOptions<Plugins>, "plugins">,
    state: GearboxState<Plugins>,
  ): this {
    const { logger: _logger, ignoreMarkets, ...opts } = options;
    if (state.version !== STATE_VERSION) {
      throw new Error(
        `hydrated state version is ${state.version}, but expected ${STATE_VERSION}`,
      );
    }
    const re = this.#attachConfig ? "re" : "";
    this.logger?.info(
      { networkType: this.networkType },
      `${re}hydrating sdk state`,
    );

    this.#currentBlock = state.currentBlock;
    this.#timestamp = state.timestamp;
    this.#priceFeeds = new PriceFeedRegister(this, {
      redstone: opts.redstone,
      pyth: opts.pyth,
    });

    this.#addressProvider = hydrateAddressProvider(this, state.addressProvider);
    this.logger?.debug(
      `address provider version: ${this.#addressProvider.version}`,
    );

    this.#marketRegister = new MarketRegister(this, ignoreMarkets);
    this.#marketRegister.hydrate(state.markets);

    this.#attachConfig = {
      ...opts,
      addressProvider: this.addressProvider.address,
      marketConfigurators: this.marketRegister.marketConfigurators.map(
        m => m.address,
      ),
      blockNumber: this.currentBlock,
    };

    for (const [name, plugin] of TypedObjectUtils.entries(this.plugins)) {
      const pluginState = state.plugins[name];
      if (plugin.hydrate && pluginState) {
        if (!pluginState.loaded) {
          this.logger?.debug(
            `skipping ${re}hydrating plugin ${name} state: not loaded`,
          );
          continue;
        }
        if (pluginState.version !== plugin.version) {
          throw new PluginStateVersionError(plugin, pluginState);
        }
        plugin.hydrate(pluginState);
      }
    }
    this.logger?.info(`${re}hydrated sdk state`);

    return this;
  }

  /**
   * Re-attaches the SDK using the same configuration, discarding all cached
   * state and re-reading everything from the chain.
   *
   * Useful when the SDK needs a full refresh (e.g. after a protocol upgrade).
   * Note that if the original `blockNumber` was pinned, the same block is
   * re-used — call {@link syncState} instead if you want to advance.
   *
   * @throws If the SDK has not been attached yet.
   **/
  public async reattach(): Promise<void> {
    if (!this.#attachConfig) {
      throw new Error("cannot reattach, attach config is not set");
    }
    await this.#attach(this.#attachConfig);
  }

  /**
   * Replaces the SDK's in-memory state with a new serialised snapshot
   * without re-creating the instance.
   *
   * After hydration the `rehydrate` hook is triggered so that listeners
   * can react to the state change.
   *
   * @param state - Serialised state obtained from {@link GearboxSDK.state}.
   * @throws If the SDK has not been attached or hydrated yet.
   **/
  public async rehydrate(state: GearboxState<Plugins>): Promise<void> {
    if (!this.#attachConfig) {
      throw new Error("cannot rehydrate, attach config is not set");
    }
    const opts: Omit<HydrateOptions<Plugins>, "plugins"> = {
      ignoreUpdateablePrices: this.#attachConfig.ignoreUpdateablePrices,
      redstone: this.#attachConfig.redstone,
      pyth: this.#attachConfig.pyth,
    };
    this.#hydrate(opts, state);

    await this.#hooks.triggerHooks("rehydrate", {
      blockNumber: state.currentBlock,
      timestamp: state.timestamp,
    });
  }

  /**
   * Gearbox network type the SDK is connected to (e.g. `"Mainnet"`, `"Arbitrum"`).
   **/
  public get networkType(): NetworkType {
    return (this.client.chain as GearboxChain).network;
  }

  /**
   * Returns a human-readable snapshot of the entire SDK state, suitable
   * for logging or diagnostic inspection.
   *
   * @param raw - When `true`, include raw numeric values alongside
   *   formatted ones.
   * @default true
   **/
  public stateHuman(raw = true): GearboxStateHuman {
    return {
      block: Number(this.currentBlock),
      timestamp: formatTimestamp(Number(this.timestamp), raw),
      core: {
        addressProviderV3: this.addressProvider.stateHuman(raw),
      },
      tokens: this.tokensMeta.values(),
      plugins: Object.fromEntries(
        TypedObjectUtils.entries(this.plugins).map(([name, plugin]) => [
          name,
          plugin.loaded ? plugin.stateHuman?.(raw) : undefined,
        ]),
      ),
      ...this.marketRegister.stateHuman(raw),
    };
  }

  /**
   * Serialisable snapshot of the current SDK state.
   *
   * The returned object can be persisted (e.g. written to a file) and later
   * passed to {@link GearboxSDK.hydrate} for instant restoration without
   * on-chain reads.
   **/
  public get state(): GearboxState<Plugins> {
    return {
      version: STATE_VERSION,
      network: this.networkType,
      chainId: this.chainId,
      currentBlock: this.currentBlock,
      timestamp: this.timestamp,
      addressProvider: this.addressProvider.state,
      markets: this.marketRegister.state,
      plugins: Object.fromEntries(
        TypedObjectUtils.entries(this.plugins).map(([name, plugin]) => [
          name,
          plugin.loaded
            ? { version: plugin.version, loaded: true, ...plugin.state }
            : { version: plugin.version, loaded: false },
        ]),
      ) as PluginStatesMap<Plugins>,
    };
  }

  /**
   * Incrementally updates the SDK state by replaying on-chain events from the
   * last processed block up to the target block (defaults to `latest`).
   *
   * Use the to periodically update sdk state on cron, or subscribe to new blocks
   * using viem's `watchBlocks`
   *
   * On failure the SDK reverts to the previous block/timestamp so that
   * subsequent calls can retry.
   *
   * @param opts - Target block and sync behaviour. When omitted the latest
   *   block is fetched automatically.
   * @returns `true` if the sync completed successfully, `false` if it was
   *   skipped or failed.
   **/
  public async syncState(opts?: SyncStateOptions): Promise<boolean> {
    let {
      blockNumber,
      timestamp,
      ignoreUpdateablePrices = this.#attachConfig?.ignoreUpdateablePrices,
    } = opts ?? {};
    if (
      this.#attachConfig?.redstone?.historicTimestamp ||
      this.#attachConfig?.pyth?.historicTimestamp
    ) {
      throw new Error(
        "syncState is not supported with redstone or pyth historicTimestamp",
      );
    }
    if (!blockNumber || !timestamp) {
      const block = await this.client.getBlock({
        blockTag: "latest",
      });
      blockNumber = block.number;
      timestamp = block.timestamp;
    }
    if (blockNumber <= this.currentBlock) {
      return false;
    }
    if (this.#syncing) {
      this.logger?.warn(
        `cannot sync to ${blockNumber}, already syncing at ${this.currentBlock}`,
      );
      return false;
    }
    this.#syncing = true;
    const prevBlock = this.currentBlock;
    const prevTimestamp = this.timestamp;
    let success = false;
    try {
      let delta = Math.floor(Date.now() / 1000) - Number(timestamp);
      this.logger?.debug(
        `syncing state to block ${blockNumber} (delta ${delta}s )...`,
      );

      const watchAddresses = [
        ...Array.from(this.marketRegister.watchAddresses),
        this.addressProvider.address,
      ];
      const fromBlock = this.currentBlock + 1n;
      this.logger?.debug(
        `getting logs from ${watchAddresses.length} addresses in [${fromBlock}:${blockNumber}]`,
      );
      const logs = await getLogsSafe(this.client, {
        fromBlock,
        toBlock: blockNumber,
        address: watchAddresses,
      });

      for (const log of logs) {
        const contract = this.getContract(log.address);
        if (contract) {
          const event = parseEventLogs({
            abi: contract.abi,
            logs: [log],
          })[0];
          contract.processLog(event);
        }
      }

      this.#currentBlock = blockNumber;
      this.#timestamp = timestamp;

      // This will reload all or some markets. Should already use sdk.currentBlock
      await this.marketRegister.syncState(ignoreUpdateablePrices);
      await this.#hooks.triggerHooks("syncState", {
        blockNumber,
        timestamp,
        ignoreUpdateablePrices,
      });

      const pluginsList = TypedObjectUtils.entries(this.plugins);
      const pluginResponse = await Promise.allSettled(
        pluginsList.map(([name, plugin]) => {
          if (plugin.syncState) {
            this.logger?.debug(`syncing plugin ${name}`);
            return plugin.syncState();
          }
          return undefined;
        }),
      );

      pluginResponse.forEach((r, i) => {
        const [name, plugin] = pluginsList[i];

        if (plugin.syncState && r.status === "fulfilled") {
          this.logger?.debug(`synced plugin ${name}`);
        } else if (plugin.syncState && r.status === "rejected") {
          this.logger?.error(r.reason, `failed to sync plugin ${name}`);
        }
      });

      delta = Math.floor(Date.now() / 1000) - Number(timestamp);
      this.logger?.debug(
        `synced state to block ${blockNumber} (delta ${delta}s)`,
      );
      success = true;
    } catch (e) {
      // possible that this is non-atomic revert
      // if logs fail, marketRegister is not synced, so this block number revert does nothing
      // if marketRegister.syncState fails, we revert
      // plugins are ignored and cannot cause this
      this.logger?.error(
        `sync state to block ${blockNumber} with ts ${timestamp} failed, reverting to old block ${prevBlock} with ts ${prevTimestamp}: ${e}`,
      );
      this.#currentBlock = prevBlock;
      this.#timestamp = prevTimestamp;
    } finally {
      this.#syncing = false;
    }
    return success;
  }

  /**
   * Block number that the SDK state corresponds to.
   *
   * @throws If the SDK has not been attached or hydrated yet.
   **/
  public get currentBlock(): bigint {
    if (this.#currentBlock === undefined) {
      throw ERR_NOT_ATTACHED;
    }
    return this.#currentBlock;
  }

  /**
   * Block timestamp (Unix epoch seconds) corresponding to {@link currentBlock}.
   *
   * @throws If the SDK has not been attached or hydrated yet.
   **/
  public get timestamp(): bigint {
    if (this.#timestamp === undefined) {
      throw ERR_NOT_ATTACHED;
    }
    return this.#timestamp;
  }

  /**
   * Global registry of all price feeds known to the SDK (on all markets).
   *
   * Unlike per-oracle price feed references, this register does not carry
   * oracle-specific metadata (staleness period, main/reserve designation, etc.).
   *
   * @throws If the SDK has not been attached or hydrated yet.
   **/
  public get priceFeeds(): PriceFeedRegister {
    if (this.#priceFeeds === undefined) {
      throw ERR_NOT_ATTACHED;
    }
    return this.#priceFeeds;
  }

  /**
   * Address of the GEAR governance token on this chain, or `undefined`
   * if the address provider does not list it.
   **/
  public get gear(): Address | undefined {
    try {
      const g = this.addressProvider.getAddress(AP_GEAR_TOKEN, NO_VERSION);
      return g;
    } catch (e) {
      this.logger?.warn(e);
      return undefined;
    }
  }

  /**
   * The chain's address provider contract, the central directory for all
   * protocol-wide Gearbox protocol addresses.
   *
   * @throws If the SDK has not been attached or hydrated yet.
   **/
  public get addressProvider(): IAddressProviderContract {
    if (this.#addressProvider === undefined) {
      throw ERR_NOT_ATTACHED;
    }
    return this.#addressProvider;
  }

  /**
   * Registry of all loaded markets (pools, credit managers, oracles, etc.).
   *
   * @throws If the SDK has not been attached or hydrated yet.
   **/
  public get marketRegister(): MarketRegister {
    if (this.#marketRegister === undefined) {
      throw ERR_NOT_ATTACHED;
    }
    return this.#marketRegister;
  }

  /**
   * Resolves the appropriate router contract for a given credit manager,
   * credit facade, or explicit version range.
   *
   * @param params - Identifies the context: a credit manager address/state,
   *   a credit facade address/state, or a {@link VersionRange}.
   * @returns The matching router contract instance.
   * @throws If the credit facade version is unsupported or no router is
   *   registered for the resolved version range.
   **/
  public routerFor(
    params:
      | { creditManager: Address | BaseState | IBaseContract }
      | { creditFacade: Address | BaseState | IBaseContract }
      | VersionRange,
  ): IRouterContract {
    let routerRange: VersionRange;
    if (Array.isArray(params)) {
      routerRange = params;
    } else {
      let facadeAddr: Address;
      if ("creditFacade" in params) {
        facadeAddr = toAddress(params.creditFacade);
      } else {
        const cm = this.marketRegister.findCreditManager(
          toAddress(params.creditManager),
        );
        facadeAddr = cm.creditFacade.address;
      }
      const facadeV = this.mustGetContract(facadeAddr).version;
      if (isV310(facadeV)) {
        routerRange = VERSION_RANGE_310;
      } else {
        throw new Error(`Unsupported credit facade version ${facadeV}`);
      }
    }
    const routerEntry = this.addressProvider.getLatest(AP_ROUTER, routerRange);
    if (!routerEntry) {
      throw new Error(`router not found in version range ${routerRange}`);
    }
    const [routerAddr, routerV] = routerEntry;
    return createRouter(this, routerAddr, routerV);
  }
}
