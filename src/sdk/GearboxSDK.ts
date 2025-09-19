import type { Address, Hex } from "viem";
import { createPublicClient, parseEventLogs } from "viem";

import type { BaseContract, BaseState, IBaseContract } from "./base/index.js";
import { TokensMeta } from "./base/index.js";
import type {
  ConnectionOptions,
  NetworkOptions,
  TransportOptions,
} from "./chain/index.js";
import {
  chains,
  createTransport,
  detectNetwork,
  Provider,
} from "./chain/index.js";
import type { VersionRange } from "./constants/index.js";
import {
  ADDRESS_PROVIDER_V310,
  AP_BOT_LIST,
  AP_GEAR_STAKING,
  AP_GEAR_TOKEN,
  AP_ROUTER,
  isV310,
  NO_VERSION,
  VERSION_RANGE_300,
  VERSION_RANGE_310,
} from "./constants/index.js";
import type { IAddressProviderContract } from "./core/index.js";
import {
  BotListContract,
  createAddressProvider,
  GearStakingContract,
  hydrateAddressProvider,
} from "./core/index.js";
import { MarketRegister } from "./market/MarketRegister.js";
import { PriceFeedRegister } from "./market/pricefeeds/index.js";
import type { SDKOptions } from "./options.js";
import {
  type PluginStatesMap,
  PluginStateVersionError,
  type PluginsMap,
} from "./plugins/index.js";
import { createRouter, type IRouterContract } from "./router/index.js";
import type {
  GearboxState,
  GearboxStateHuman,
  ILogger,
  MultiCall,
} from "./types/index.js";
import type { PickSomeRequired } from "./utils/index.js";
import { AddressMap, TypedObjectUtils, toAddress } from "./utils/index.js";
import { Hooks } from "./utils/internal/index.js";
import { getLogsSafe } from "./utils/viem/index.js";

const ERR_NOT_ATTACHED = new Error("Gearbox SDK not attached");

/**
 * State version, checked duryng hydration
 */
export const STATE_VERSION = 1;

export type HydrateOptions<Plugins extends PluginsMap> = Omit<
  SDKOptions<Plugins>,
  "blockNumber" | "addressProvider" | "marketConfigurators"
>;

type SDKContructorArgs<Plugins extends PluginsMap> = Pick<
  SDKOptions<Plugins>,
  "logger" | "strictContractTypes" | "plugins" | "gasLimit"
> & {
  provider: Provider;
};

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

export interface SyncStateOptions {
  blockNumber: bigint;
  timestamp: bigint;
  skipPriceUpdate?: boolean;
}

export type SDKHooks = {
  syncState: [SyncStateOptions];
  rehydrate: [SyncStateOptions];
};

export class GearboxSDK<const Plugins extends PluginsMap = {}> {
  readonly #hooks = new Hooks<SDKHooks>();
  // Represents chain object
  readonly #provider: Provider;
  readonly plugins: Plugins;

  // Block which was use for data query
  #currentBlock?: bigint;
  #timestamp?: bigint;
  #syncing = false;

  // Collection of core singleton contracts
  #addressProvider?: IAddressProviderContract;
  #attachConfig?: AttachOptionsInternal;

  // Collection of markets
  #marketRegister?: MarketRegister;
  #priceFeeds?: PriceFeedRegister;

  public readonly logger?: ILogger;
  public readonly gasLimit: bigint | undefined;

  /**
   * Interest rate models can be reused across chain (and SDK operates on chain level)
   * TODO: use whatever interface is necessary for InterestRateModels
   */
  public readonly interestRateModels = new AddressMap<
    BaseContract<readonly unknown[]>
  >();

  /**
   * Will throw an error if contract type is not supported, otherwise will try to use generic contract first, if possible
   */
  public readonly strictContractTypes: boolean;
  /**
   * All contracts known to sdk
   */
  public readonly contracts = new AddressMap<BaseContract<any>>(
    undefined,
    "contracts",
  );
  /**
   * Token metadata such as symbol and decimals
   */
  public readonly tokensMeta = new TokensMeta(undefined, "tokensMeta");

  public addHook = this.#hooks.addHook.bind(this.#hooks);
  public removeHook = this.#hooks.removeHook.bind(this.#hooks);

  public static async attach<const Plugins extends PluginsMap>(
    options: SDKOptions<Plugins> &
      Partial<NetworkOptions> &
      ConnectionOptions &
      TransportOptions,
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
    let { networkType, addressProvider, chainId } = options;

    const transport = createTransport(options);
    const attachClient = createPublicClient({ transport });
    if (!networkType) {
      networkType = await detectNetwork(attachClient);
    }
    if (!chainId) {
      chainId = await attachClient.getChainId();
    }
    if (!addressProvider) {
      addressProvider = ADDRESS_PROVIDER_V310;
    }
    const marketConfigurators =
      mcs ??
      TypedObjectUtils.keys(chains[networkType].defaultMarketConfigurators);

    const provider = new Provider({
      ...options,
      transport, // pass transport to avoid creating a new transport in provider
      chainId,
      networkType,
    });

    return new GearboxSDK<Plugins>({
      provider,
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

  public static hydrate<const Plugins extends PluginsMap>(
    options: HydrateOptions<Plugins> & ConnectionOptions & TransportOptions,
    state: GearboxState<Plugins>,
  ): GearboxSDK<Plugins> {
    const { logger, plugins, strictContractTypes, gasLimit, ...rest } = options;
    const provider = new Provider({
      ...rest,
      chainId: state.chainId,
      networkType: state.network,
    });

    return new GearboxSDK({
      provider,
      plugins,
      logger,
      strictContractTypes,
      gasLimit,
    }).#hydrate(rest, state);
  }

  private constructor(options: SDKContructorArgs<Plugins>) {
    this.#provider = options.provider;
    this.logger = options.logger;
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
        networkType: this.provider.networkType,
        chainId: this.provider.chainId,
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
    const block = await this.provider.publicClient.getBlock(
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
      {
        networkType: this.provider.networkType,
      },
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
   * Reattach SDK with the same config as before, without re-creating instance. Will load all state from scratch
   * Be mindful of block number, for example
   */
  public async reattach(): Promise<void> {
    if (!this.#attachConfig) {
      throw new Error("cannot reattach, attach config is not set");
    }
    await this.#attach(this.#attachConfig);
  }

  /**
   * Rehydrate existing SDK from new state without re-creating instance
   */
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
   * Converts contract call into some human-friendly string
   * This method is safe and should not throw
   * @param address
   * @param calldata
   * @returns
   */
  public parseFunctionData(address: Address, calldata: Hex): string {
    const contract = this.contracts.get(address);
    // TODO: fallback to 4bytes directory
    return contract
      ? contract.parseFunctionData(calldata)
      : `unknown: ${address}.${calldata.slice(0, 10)}`;
  }

  /**
   * Converts multicalls into some human-friendly strings
   * This method is safe and should not throw
   * @param address
   * @param calldata
   * @returns
   */
  public parseMultiCall(calls: MultiCall[]): string[] {
    return calls.map(call =>
      this.parseFunctionData(call.target, call.callData),
    );
  }

  /**
   * Return args, function, type and address name from contract call
   * @param address
   * @param calldata
   * @returns
   */
  public parseFunctionDataToObject(address: Address, calldata: Hex) {
    const contract = this.contracts.get(address);
    // TODO: fallback to 4bytes directory

    return contract
      ? {
          ...contract.parseFunctionDataToObject(calldata),
          address,
          type: contract.contractType,
        }
      : null;
  }

  /**
   * Converts multicalls into call info
   * @param address
   * @param calldata
   * @returns
   */
  public parseMultiCallToObject(calls: MultiCall[]) {
    return calls.map(call =>
      this.parseFunctionDataToObject(call.target, call.callData),
    );
  }

  public stateHuman(raw = true): GearboxStateHuman {
    return {
      block: Number(this.currentBlock),
      timestamp: Number(this.timestamp),
      core: {
        addressProviderV3: this.addressProvider.stateHuman(raw),
        botList: this.botListContract?.stateHuman(raw),
        gearStakingV3: this.gearStakingContract?.stateHuman(raw),
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

  public get state(): GearboxState<Plugins> {
    return {
      version: STATE_VERSION,
      network: this.provider.networkType,
      chainId: this.provider.chainId,
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
   * Reloads markets states based on events from last processed block to new block (defaults to latest block)
   * @param opts
   * @returns
   */
  public async syncState(opts?: SyncStateOptions): Promise<void> {
    let { blockNumber, timestamp, skipPriceUpdate } = opts ?? {};
    if (
      this.#attachConfig?.redstone?.historicTimestamp ||
      this.#attachConfig?.pyth?.historicTimestamp
    ) {
      throw new Error(
        "syncState is not supported with redstone or pyth historicTimestamp",
      );
    }
    if (!blockNumber || !timestamp) {
      const block = await this.provider.publicClient.getBlock({
        blockTag: "latest",
      });
      blockNumber = block.number;
      timestamp = block.timestamp;
    }
    if (blockNumber <= this.currentBlock) {
      return;
    }
    if (this.#syncing) {
      this.logger?.warn(`cannot sync to ${blockNumber}, already syncing`);
      return;
    }
    this.#syncing = true;
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
    const logs = await getLogsSafe(this.provider.publicClient, {
      fromBlock,
      toBlock: blockNumber,
      address: watchAddresses,
    });

    for (const log of logs) {
      const contract = this.contracts.get(log.address);
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
    await this.marketRegister.syncState(skipPriceUpdate);
    // TODO: do wee need to sync state on botlist and others?
    //
    // TODO: how to handle "singleton" contracts addresses, where contract instance is shared across multiple other contract instrances
    // This behaviour should be reserved for contracts with 100% immutable state, such as InterestRateModel?
    await this.#hooks.triggerHooks("syncState", { blockNumber, timestamp });

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

    this.#syncing = false;
    delta = Math.floor(Date.now() / 1000) - Number(timestamp);
    this.logger?.debug(
      `synced state to block ${blockNumber} (delta ${delta}s)`,
    );
  }

  public get provider(): Provider {
    return this.#provider;
  }

  public get currentBlock(): bigint {
    if (this.#currentBlock === undefined) {
      throw ERR_NOT_ATTACHED;
    }
    return this.#currentBlock;
  }

  public get timestamp(): bigint {
    if (this.#timestamp === undefined) {
      throw ERR_NOT_ATTACHED;
    }
    return this.#timestamp;
  }

  /**
   * All price feeds known to sdk, without oracle-related data (stalenessPeriod, main/reserve, etc.)
   */
  public get priceFeeds(): PriceFeedRegister {
    if (this.#priceFeeds === undefined) {
      throw ERR_NOT_ATTACHED;
    }
    return this.#priceFeeds;
  }

  public get gear(): Address | undefined {
    try {
      const g = this.addressProvider.getAddress(AP_GEAR_TOKEN, NO_VERSION);
      return g;
    } catch (e) {
      this.logger?.warn(e);
      return undefined;
    }
  }

  public get addressProvider(): IAddressProviderContract {
    if (this.#addressProvider === undefined) {
      throw ERR_NOT_ATTACHED;
    }
    return this.#addressProvider;
  }

  public get botListContract(): BotListContract | undefined {
    const addr = this.addressProvider.getAddress(AP_BOT_LIST, NO_VERSION);
    if (!this.contracts.has(addr)) {
      // this registers it in sdk.contracts as constructor's side-effect
      return new BotListContract(this, addr);
    }
    return this.contracts.get(addr) as unknown as BotListContract;
  }

  public get gearStakingContract(): GearStakingContract | undefined {
    const addr = this.addressProvider.getAddress(AP_GEAR_STAKING, NO_VERSION);
    if (!this.contracts.has(addr)) {
      // this registers it in sdk.contracts as constructor's side-effect
      return new GearStakingContract(this, addr);
    }
    return this.contracts.get(addr) as unknown as GearStakingContract;
  }

  public get marketRegister(): MarketRegister {
    if (this.#marketRegister === undefined) {
      throw ERR_NOT_ATTACHED;
    }
    return this.#marketRegister;
  }

  /**
   * Returns router contract that will work for given credit manager or credit facade, or simply version range
   * @param params
   * @returns
   */
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
      const facadeV = this.contracts.mustGet(facadeAddr).version;
      routerRange = isV310(facadeV) ? VERSION_RANGE_310 : VERSION_RANGE_300;
    }
    const routerEntry = this.addressProvider.getLatest(AP_ROUTER, routerRange);
    if (!routerEntry) {
      throw new Error(`router not found in version range ${routerRange}`);
    }
    const [routerAddr, routerV] = routerEntry;
    if (!this.contracts.has(routerAddr)) {
      // router is added to this.contracts as constructor's side-effect
      return createRouter(this, routerAddr, routerV);
    }
    return this.contracts.get(routerAddr) as unknown as IRouterContract;
  }

  /**
   * Helper to get human-friendly label for address
   * @param address
   * @returns
   */
  public labelAddress(address: Address): string {
    return this.provider.addressLabels.get(address);
  }
}
