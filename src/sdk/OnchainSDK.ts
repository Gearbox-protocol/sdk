import type { Address } from "viem";
import {
  createPublicClient,
  fallback,
  http,
  type PublicClient,
  parseEventLogs,
  type Transport,
} from "viem";
import type { HttpRpcClientOptions } from "viem/utils";
import {
  CreditAccountsServiceV310,
  createWithdrawalCompressor,
  type ICreditAccountsService,
  type ILiquidationsService,
  type IWithdrawalCompressorContract,
  LiquidationsService,
} from "./accounts/index.js";
import type { BaseState, IBaseContract } from "./base/index.js";
import { ChainContractsRegister } from "./base/index.js";
import type { GearboxChain, NetworkType } from "./chain/chains.js";
import { getChain } from "./chain/index.js";
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
import {
  createAddressProvider,
  hydrateAddressProvider,
  SdkAlreadyAttachedError,
  SdkChainMismatchError,
  SdkNotAttachedError,
  SdkStateVersionMismatchError,
} from "./core/index.js";
import { RWARegistry } from "./market/index.js";
import { MarketRegister } from "./market/MarketRegister.js";
import { PriceFeedRegister } from "./market/pricefeeds/index.js";
import type {
  PythOptions,
  RedstoneOptions,
} from "./market/pricefeeds/updates/index.js";
import type { PluginStatesMap, PluginsMap } from "./plugins/index.js";
import { PluginStateVersionError } from "./plugins/index.js";
import { type IPoolsService, PoolService } from "./pools/index.js";
import { createRouter, type IRouterContract } from "./router/index.js";
import type {
  GearboxState,
  GearboxStateHuman,
  ILogger,
  IPriceUpdateTx,
} from "./types/index.js";
import { formatTimestamp, TypedObjectUtils, toAddress } from "./utils/index.js";
import {
  type DelegatedMulticall,
  executeDelegatedMulticalls,
} from "./utils/viem/index.js";

/**
 * Serialised state format version, checked during hydration to detect
 * incompatible snapshots.
 **/
export const STATE_VERSION = 1;

/**
 * Connection options for the underlying JSON-RPC provider.
 *
 * Supply **one** of the three variants:
 * - `rpcURLs` — the SDK creates a viem transport internally (with optional
 *    fallback when multiple URLs are given).
 * - `transport` — bring your own viem `Transport`.
 * - `client` — bring your own fully-configured viem `PublicClient`.
 **/
export type ClientOptions =
  | {
      /**
       * One or more JSON-RPC endpoint URLs.
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
       **/
      client: PublicClient<Transport, GearboxChain>;
    };

/**
 * Options for creating an {@link OnchainSDK} instance.
 *
 * @typeParam Plugins - Map of plugin names to plugin instances.
 **/
export interface OnchainSDKOptions<Plugins extends PluginsMap> {
  /**
   * Custom logger implementation.
   **/
  logger?: ILogger;
  /**
   * When `true`, throw on unrecognised contract types instead of falling back to a generic contract wrapper.
   **/
  strictContractTypes?: boolean;
  /**
   * Explicit gas limit for read-only `eth_call` requests.
   * `null` disables the gas limit entirely; `undefined` uses the SDK default (550M).
   */
  gasLimit?: bigint | null;
  /**
   * Plugins that extend SDK functionality.
   **/
  plugins?: Plugins;
}

/**
 * Options accepted by {@link OnchainSDK.attach}.
 **/
export interface AttachOptions {
  /**
   * Override address of the Gearbox AddressProvider contract.
   **/
  addressProvider?: Address;
  /**
   * Addresses of market configurator contracts to load.
   **/
  marketConfigurators?: Address[];
  /**
   * Addresses of RWA factory contracts to load.
   **/
  rwaFactories?: Address[];
  /**
   * Pin SDK to a specific block number during attach.
   **/
  blockNumber?: bigint | number;
  /**
   * Skip fetching updatable price feeds on attach and sync.
   **/
  ignoreUpdateablePrices?: boolean;
  /**
   * Pool addresses whose markets should be skipped.
   **/
  ignoreMarkets?: Address[];
  /**
   * Options for Redstone price-feed updates.
   **/
  redstone?: RedstoneOptions;
  /**
   * Options for Pyth price-feed updates.
   **/
  pyth?: PythOptions;
  /**
   * When `true`, automatically call {@link MarketRegister.loadZappers} during attach.
   **/
  loadZappers?: boolean;
}

/**
 * Options accepted by {@link OnchainSDK.hydrate}.
 **/
export interface HydrateOptions {
  /**
   * Pool addresses whose markets should be skipped.
   **/
  ignoreMarkets?: Address[];
  /**
   * Options for Redstone price-feed updates.
   **/
  redstone?: RedstoneOptions;
  /**
   * Options for Pyth price-feed updates.
   **/
  pyth?: PythOptions;
}

/**
 * Options for {@link OnchainSDK.syncState}, controlling which block to
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
 * @internal
 * Creates a viem `PublicClient` from the given connection options.
 */
function createViemClient(
  opts: ClientOptions,
  chain?: GearboxChain,
): PublicClient<Transport, GearboxChain> {
  if ("client" in opts) {
    return opts.client;
  }
  let transport: Transport;
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
  return createPublicClient({ transport, chain });
}

/**
 * Single-chain entry point for the Gearbox SDK.
 *
 * `OnchainSDK` aggregates on-chain state for the Gearbox protocol — markets,
 * credit managers, pools, price oracles, and price feeds — into a single
 * queryable object that can be kept up-to-date via {@link syncState} or
 * serialised/restored via {@link state}/{@link hydrate}.
 *
 * Create an instance with `new OnchainSDK(network, clientOptions, options)`,
 * then call {@link attach} (live chain data) or {@link hydrate} (saved snapshot).
 *
 * @typeParam Plugins - Map of plugin names to plugin instances that extend
 *   the SDK with additional domain-specific functionality.
 **/
export class OnchainSDK<
  const Plugins extends PluginsMap = {},
> extends ChainContractsRegister {
  /** Registered plugin instances, keyed by plugin name. */
  readonly plugins: Plugins;

  #currentBlock?: bigint;
  #timestamp?: bigint;
  #syncing = false;
  #attached = false;

  #addressProvider?: IAddressProviderContract;

  #rwa: RWARegistry;
  #marketRegister?: MarketRegister;
  #priceFeeds?: PriceFeedRegister;
  readonly #withdrawalCompressor?: IWithdrawalCompressorContract;

  /**
   * Gas limit applied to read-only `eth_call` requests.
   **/
  public readonly gasLimit: bigint | undefined;

  /**
   * When `true`, the SDK throws on unrecognised contract types.
   **/
  public readonly strictContractTypes: boolean;

  /**
   * Namespace for credit accounts operations.
   */
  public readonly accounts: ICreditAccountsService;
  /**
   * Namespace for pool operations.
   */
  public readonly pools: IPoolsService;
  /**
   * Namespace for liquidatable credit accounts discovery.
   */
  public readonly liquidations: ILiquidationsService;

  /**
   * @param network - Gearbox network type (e.g. `"Mainnet"`, `"Monad"`).
   * @param clientOptions - Connection options (RPC URLs, transport, or client).
   * @param options - SDK configuration options.
   */
  constructor(
    network: NetworkType,
    clientOptions: ClientOptions,
    options?: OnchainSDKOptions<Plugins>,
  ) {
    const gearboxChain = getChain(network);

    if ("client" in clientOptions) {
      const clientChainId = clientOptions.client.chain?.id;
      if (clientChainId !== undefined && clientChainId !== gearboxChain.id) {
        throw new SdkChainMismatchError(gearboxChain.id, clientChainId);
      }
    }

    const client = createViemClient(clientOptions, gearboxChain);
    super(client, options?.logger);

    this.strictContractTypes = options?.strictContractTypes ?? false;
    this.plugins = options?.plugins ?? ({} as Plugins);
    this.#rwa = new RWARegistry(this);

    for (const plugin of Object.values(this.plugins)) {
      plugin.sdk = this;
    }
    if (options?.gasLimit !== null) {
      this.gasLimit = options?.gasLimit ?? getChain(this.networkType).gasLimit;
    }
    this.accounts = new CreditAccountsServiceV310(this);
    this.pools = new PoolService(this);
    this.liquidations = new LiquidationsService(this);
    this.#withdrawalCompressor = createWithdrawalCompressor(this);
  }

  /**
   * Initialises the SDK by reading live on-chain state.
   *
   * @param options - Attach configuration.
   * @throws {@link SdkAlreadyAttachedError} if already attached.
   */
  public async attach(options?: AttachOptions): Promise<void> {
    if (this.#attached) {
      throw new SdkAlreadyAttachedError();
    }
    const {
      addressProvider = ADDRESS_PROVIDER_V310,
      blockNumber,
      ignoreUpdateablePrices,
      ignoreMarkets,
      marketConfigurators: mcs,
      redstone,
      pyth,
      loadZappers,
    } = options ?? {};

    const marketConfigurators =
      mcs ??
      TypedObjectUtils.keys(
        (this.client.chain as GearboxChain).defaultMarketConfigurators,
      );
    const rwaFactories =
      options?.rwaFactories ?? (this.client.chain as GearboxChain).rwaFactories;

    this.logger?.info(
      {
        networkType: this.networkType,
        chainId: this.chainId,
        addressProvider,
        marketConfigurators,
        blockNumber,
        ignoreMarkets,
      },
      "attaching sdk",
    );

    const time = Date.now();
    const block = await this.client.getBlock(
      blockNumber
        ? { blockNumber: BigInt(blockNumber) }
        : { blockTag: "latest" },
    );
    this.#currentBlock = block.number;
    this.#timestamp = block.timestamp;

    // attaching to historical block but providing latest price update will fail
    // with PriceTimestampTooFarAheadException if we exceed MAX_DATA_TIMESTAMP_AHEAD_SECONDS (1 minute)
    if (
      blockNumber &&
      !redstone?.historicTimestamp &&
      time - Number(block.timestamp) * 1000 > 60 * 1000
    ) {
      this.logger?.warn(
        "attaching to fixed block number, but redstone historicTimestamp is not set. price updates might fail",
      );
    }
    if (
      blockNumber &&
      !pyth?.historicTimestamp &&
      time - Number(block.timestamp) * 1000 > 60 * 1000
    ) {
      this.logger?.warn(
        "attaching to fixed block number, but pyth historicTimestamp is not set. price updates might fail",
      );
    }

    this.#priceFeeds = new PriceFeedRegister(this, { redstone, pyth });

    this.logger?.debug(
      `attach block number ${this.currentBlock} timestamp ${this.timestamp}`,
    );
    this.#addressProvider = await createAddressProvider(this, addressProvider);
    this.logger?.debug(
      `address provider version: ${this.#addressProvider.version}`,
    );
    await this.#addressProvider.syncState(this.currentBlock);

    this.#marketRegister = new MarketRegister(this, ignoreMarkets);
    if (!marketConfigurators.length) {
      this.logger?.warn(
        "no market configurators provided, skipping market loading",
      );
    } else {
      const delegated: DelegatedMulticall[] = [
        ...this.#marketRegister.getLoadMulticalls(marketConfigurators),
        ...this.#rwa.getLoadMulticalls(marketConfigurators, rwaFactories),
      ];

      let txs: IPriceUpdateTx[] = [];
      if (!ignoreUpdateablePrices) {
        const updatables =
          await this.#priceFeeds.getPartialUpdatablePriceFeeds(
            marketConfigurators,
          );
        const updates =
          await this.#priceFeeds.generatePriceFeedsUpdateTxs(updatables);
        txs = updates.txs;
      }
      this.logger?.debug(
        { configurators: marketConfigurators },
        `calling getMarkets with ${txs.length} price updates in block ${this.currentBlock}`,
      );

      await executeDelegatedMulticalls(this.client, delegated, {
        priceUpdates: txs,
        blockNumber: this.currentBlock,
        gas: this.gasLimit,
      });

      if (loadZappers) {
        await this.#marketRegister.loadZappers();
      }
    }

    const pluginsList = TypedObjectUtils.entries(this.plugins);
    const pluginResponse = await Promise.allSettled(
      pluginsList.map(([name, plugin]) => {
        if (plugin.attach) {
          this.logger?.debug(`attaching plugin ${name}`);
          return plugin.attach();
        }
        return undefined;
      }),
    );

    pluginResponse.forEach((r, i) => {
      const [name, plugin] = pluginsList[i];

      if (plugin.attach && r.status === "fulfilled") {
        this.logger?.debug(`attached plugin ${name}`);
      } else if (plugin.attach && r.status === "rejected") {
        this.logger?.error(r.reason, `failed to attach plugin ${name}`);
      }
    });

    this.logger?.info(`attach time: ${Date.now() - time} ms`);
    this.#attached = true;
  }

  /**
   * Restores SDK state from a previously serialised {@link GearboxState}
   * snapshot, without making any on-chain calls.
   *
   * @param state - Serialised state obtained from {@link OnchainSDK.state}.
   * @param options - Hydrate configuration.
   * @throws {@link SdkAlreadyAttachedError} if already attached.
   * @throws {@link SdkStateVersionMismatchError} if snapshot version doesn't match.
   * @throws {@link SdkChainMismatchError} if snapshot network doesn't match.
   */
  public hydrate(state: GearboxState<Plugins>, options?: HydrateOptions): void {
    if (this.#attached) {
      throw new SdkAlreadyAttachedError();
    }
    if (state.version !== STATE_VERSION) {
      throw new SdkStateVersionMismatchError(STATE_VERSION, state.version);
    }
    if (state.network !== this.networkType) {
      throw new SdkChainMismatchError(this.networkType, state.network);
    }

    const { ignoreMarkets, redstone, pyth } = options ?? {};

    this.logger?.info({ networkType: this.networkType }, "hydrating sdk state");

    this.#currentBlock = state.currentBlock;
    this.#timestamp = state.timestamp;
    this.#priceFeeds = new PriceFeedRegister(this, { redstone, pyth });

    this.#addressProvider = hydrateAddressProvider(this, state.addressProvider);
    this.logger?.debug(
      `address provider version: ${this.#addressProvider.version}`,
    );

    this.#marketRegister = new MarketRegister(this, ignoreMarkets);
    this.#marketRegister.hydrate(state);

    this.#rwa = new RWARegistry(this);
    this.#rwa.setState(state.rwa);

    if (state.withdrawals) {
      this.#withdrawalCompressor?.hydrate(state.withdrawals);
    }

    for (const [name, plugin] of TypedObjectUtils.entries(this.plugins)) {
      const pluginState = state.plugins[name];
      if (plugin.hydrate && pluginState) {
        if (!pluginState.loaded) {
          this.logger?.debug(
            `skipping hydrating plugin ${name} state: not loaded`,
          );
          continue;
        }
        if (pluginState.version !== plugin.version) {
          throw new PluginStateVersionError(plugin, pluginState);
        }
        plugin.hydrate(pluginState);
      }
    }
    this.logger?.info("hydrated sdk state");
    this.#attached = true;
  }

  /**
   * Gearbox network type the SDK is connected to (e.g. `"Mainnet"`, `"Arbitrum"`).
   **/
  public get networkType(): NetworkType {
    return (this.client.chain as GearboxChain).network;
  }

  /**
   * Whether the SDK has been initialised via {@link attach} or {@link hydrate}.
   **/
  public get attached(): boolean {
    return this.#attached;
  }

  /**
   * Returns a human-readable snapshot of the entire SDK state.
   * @param raw - When `true`, include raw numeric values alongside formatted ones.
   */
  public stateHuman(raw = true): GearboxStateHuman {
    return {
      network: this.networkType,
      block: Number(this.currentBlock),
      timestamp: formatTimestamp(Number(this.timestamp), raw),
      core: {
        addressProviderV3: this.addressProvider.stateHuman(raw),
      },
      tokens: this.tokensMeta.values(),
      rwa: this.#rwa.stateHuman(raw),
      plugins: Object.fromEntries(
        TypedObjectUtils.entries(this.plugins).map(([name, plugin]) => [
          name,
          plugin.loaded ? plugin.stateHuman?.(raw) : undefined,
        ]),
      ),
      ...this.marketRegister.stateHuman(raw),
    };
  }

  /** Serialisable snapshot of the current SDK state. */
  public get state(): GearboxState<Plugins> {
    return {
      version: STATE_VERSION,
      network: this.networkType,
      chainId: this.chainId,
      currentBlock: this.currentBlock,
      timestamp: this.timestamp,
      addressProvider: this.addressProvider.state,
      ...this.marketRegister.state,
      rwa: this.#rwa.state,
      withdrawals: this.#withdrawalCompressor?.state,
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
   * Incrementally updates SDK state by replaying on-chain events.
   *
   * @param opts - Target block and sync behaviour.
   * @returns `true` if the sync completed successfully.
   */
  public async syncState(opts?: SyncStateOptions): Promise<boolean> {
    let { blockNumber, timestamp, ignoreUpdateablePrices } = opts ?? {};
    if (this.priceFeeds.historical && !ignoreUpdateablePrices) {
      this.logger?.warn(
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
      const logs = await this.client.getLogs({
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

      await this.marketRegister.syncState(ignoreUpdateablePrices);

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
   * @throws {@link SdkNotAttachedError} if not attached.
   */
  public get currentBlock(): bigint {
    if (this.#currentBlock === undefined) {
      throw new SdkNotAttachedError();
    }
    return this.#currentBlock;
  }

  /**
   * Block timestamp (Unix epoch seconds) corresponding to {@link currentBlock}.
   * @throws {@link SdkNotAttachedError} if not attached.
   */
  public get timestamp(): bigint {
    if (this.#timestamp === undefined) {
      throw new SdkNotAttachedError();
    }
    return this.#timestamp;
  }

  /**
   * Global registry of all price feeds known to the SDK.
   * @throws {@link SdkNotAttachedError} if not attached.
   */
  public get priceFeeds(): PriceFeedRegister {
    if (this.#priceFeeds === undefined) {
      throw new SdkNotAttachedError();
    }
    return this.#priceFeeds;
  }

  /** GEAR governance token address, or `undefined` if not listed. */
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
   * The chain's address provider contract.
   * @throws {@link SdkNotAttachedError} if not attached.
   */
  public get addressProvider(): IAddressProviderContract {
    if (this.#addressProvider === undefined) {
      throw new SdkNotAttachedError();
    }
    return this.#addressProvider;
  }

  /**
   * Registry of all loaded markets.
   * @throws {@link SdkNotAttachedError} if not attached.
   */
  public get marketRegister(): MarketRegister {
    if (this.#marketRegister === undefined) {
      throw new SdkNotAttachedError();
    }
    return this.#marketRegister;
  }

  /**
   * RWA register for RWA-wrapped underlying tokens and factories.
   *
   * @throws If the SDK has not been attached or hydrated yet.
   **/
  public get rwa(): RWARegistry {
    if (this.#rwa === undefined) {
      throw new SdkNotAttachedError();
    }
    return this.#rwa;
  }

  /**
   * @internal
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

  /**
   * Withdrawal compressor contract for the current chain, or `undefined`
   * when no withdrawal compressor is supported on it.
   **/
  public get withdrawalCompressor(): IWithdrawalCompressorContract | undefined {
    return this.#withdrawalCompressor;
  }
}
