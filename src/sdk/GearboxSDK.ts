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
import {
  ADDRESS_PROVIDER_V310,
  AP_BOT_LIST,
  AP_GEAR_STAKING,
  AP_GEAR_TOKEN,
  AP_ROUTER,
  NO_VERSION,
} from "./constants/index.js";
import type { IAddressProviderContract } from "./core/index.js";
import {
  BotListContract,
  createAddressProvider,
  GearStakingContract,
} from "./core/index.js";
import { MarketRegister } from "./market/MarketRegister.js";
import { PriceFeedRegister } from "./market/pricefeeds/index.js";
import {
  defaultPlugins,
  type IGearboxSDKPlugin,
  type PluginInstances,
  type PluginMap,
} from "./plugins/index.js";
import type { IGearboxSDKPluginConstructor } from "./plugins/types.js";
import { createRouter, type IRouterContract } from "./router/index.js";
import type {
  GearboxState,
  GearboxStateHuman,
  ILogger,
  MultiCall,
} from "./types/index.js";
import {
  AddressMap,
  formatBN,
  toAddress,
  TypedObjectUtils,
} from "./utils/index.js";
import { Hooks } from "./utils/internal/index.js";
import { getLogsSafe } from "./utils/viem/index.js";

const ERR_NOT_ATTACHED = new Error("Gearbox SDK not attached");

export interface SDKOptions<Plugins extends PluginMap = {}> {
  /**
   * If not set, address provider address is determinted automatically from networkType
   */
  addressProvider?: Address;
  /**
   * Market configurators
   */
  marketConfigurators?: Address[];
  /**
   * Attach and load state at this specific block number
   */
  blockNumber?: bigint | number;
  /**
   * Fixed redstone historic timestamp in ms
   * Set to true to enable redstone historical mode using timestamp from attach block
   */
  redstoneHistoricTimestamp?: number | true;
  /**
   * Override redstone gateways. Can be used to set caching proxies, to avoid rate limiting
   */
  redstoneGateways?: string[];
  /**
   * Will skip updateable prices on attach and sync
   * Makes things faster when your service is not intereseted in prices
   */
  ignoreUpdateablePrices?: boolean;
  /**
   * Will throw an error if contract type is not supported, otherwise will try to use generic contract first, if possible
   */
  strictContractTypes?: boolean;
  /**
   * Plugins to extends SDK functionality
   */
  plugins?: Plugins;
  /**
   * Bring your own logger
   */
  logger?: ILogger;
}

interface SDKContructorArgs<Plugins extends PluginMap = {}> {
  provider: Provider;
  logger?: ILogger;
  strictContractTypes?: boolean;
  plugins?: Plugins;
}

interface AttachOptionsInternal {
  addressProvider: Address;
  blockNumber?: bigint | number;
  redstoneHistoricTimestamp?: number | true;
  redstoneGateways?: string[];
  ignoreUpdateablePrices?: boolean;
  marketConfigurators: Address[];
}

export interface SyncStateOptions {
  blockNumber: bigint;
  timestamp: bigint;
  skipPriceUpdate?: boolean;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type SDKHooks = {
  syncState: [SyncStateOptions];
};

export class GearboxSDK<Plugins extends PluginMap = {}> {
  readonly #hooks = new Hooks<SDKHooks>();
  // Represents chain object
  readonly #provider: Provider;
  readonly plugins: PluginInstances<Plugins>;

  // Block which was use for data query
  #currentBlock?: bigint;
  #timestamp?: bigint;
  #syncing = false;

  // Collection of core singleton contracts
  #addressProvider?: IAddressProviderContract;
  #attachConfig?: AttachOptionsInternal;

  // Collection of markets
  #marketRegister?: MarketRegister;

  public readonly logger?: ILogger;

  /**
   * Interest rate models can be reused across chain (and SDK operates on chain level)
   * TODO: use whatever interface is necessary for InterestRateModels
   */
  public readonly interestRateModels = new AddressMap<
    BaseContract<readonly unknown[]>
  >();
  /**
   * All price feeds known to sdk, without oracle-related data (stalenessPeriod, main/reserve, etc.)
   */
  public readonly priceFeeds: PriceFeedRegister;
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

  public static async attach<Plugins extends PluginMap>(
    options: SDKOptions<Plugins> &
      Partial<NetworkOptions> &
      ConnectionOptions &
      TransportOptions,
  ): Promise<GearboxSDK<Plugins>> {
    const {
      logger,
      plugins,
      blockNumber,
      redstoneHistoricTimestamp,
      ignoreUpdateablePrices,
      marketConfigurators: mcs,
    } = options;
    let { networkType, addressProvider, chainId } = options;

    const attachClient = createPublicClient({
      transport: createTransport(options),
    });
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
      chainId,
      networkType,
    });

    return new GearboxSDK<Plugins>({
      provider,
      logger,
      plugins,
    }).#attach({
      addressProvider,
      blockNumber,
      redstoneHistoricTimestamp,
      ignoreUpdateablePrices,
      marketConfigurators,
    });
  }

  private constructor(options: SDKContructorArgs<Plugins>) {
    this.#provider = options.provider;
    this.logger = options.logger;
    this.priceFeeds = new PriceFeedRegister(this);
    this.strictContractTypes = options.strictContractTypes ?? false;
    const pluginsInstances: Record<string, IGearboxSDKPlugin> = {};
    const pluginConstructros: Record<string, IGearboxSDKPluginConstructor> = {
      ...defaultPlugins,
      ...options.plugins,
    };
    for (const [name, Plugin] of TypedObjectUtils.entries(pluginConstructros)) {
      pluginsInstances[name] = new Plugin(this);
    }
    this.plugins = pluginsInstances as PluginInstances<Plugins>;
  }

  async #attach(opts: AttachOptionsInternal): Promise<this> {
    const {
      addressProvider,
      blockNumber,
      redstoneHistoricTimestamp,
      redstoneGateways,
      ignoreUpdateablePrices,
      marketConfigurators,
    } = opts;
    const re = this.#attachConfig ? "re" : "";
    this.logger?.info(
      {
        networkType: this.provider.networkType,
        chainId: this.provider.chainId,
        addressProvider,
        marketConfigurators,
      },
      `${re}attaching gearbox sdk`,
    );
    if (!!blockNumber && !redstoneHistoricTimestamp) {
      this.logger?.warn(
        `${re}attaching to fixed block number, but redstoneHistoricTimestamp is not set. price updates might fail`,
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

    if (redstoneHistoricTimestamp) {
      this.priceFeeds.redstoneUpdater.historicalTimestamp =
        redstoneHistoricTimestamp === true
          ? Number(block.timestamp) * 1000
          : redstoneHistoricTimestamp;
    }
    if (redstoneGateways?.length) {
      this.priceFeeds.redstoneUpdater.gateways = redstoneGateways;
    }

    this.logger?.debug(
      `${re}attach block number ${this.currentBlock} timestamp ${this.timestamp}`,
    );
    this.#addressProvider = await createAddressProvider(this, addressProvider);
    this.logger?.debug(
      `address provider version: ${this.#addressProvider.version}`,
    );
    await this.#addressProvider.syncState(this.currentBlock);

    this.#marketRegister = new MarketRegister(this);
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

  /**
   * Reattach SDK with the same config as before, without re-creating instance. Will load all state from scratch
   * Be mindful of block number, for example
   */
  public async reattach(): Promise<void> {
    if (!this.#attachConfig) {
      throw new Error("SDK not attached");
    }
    await this.#attach(this.#attachConfig);
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
          plugin.stateHuman?.(raw) ?? {},
        ]),
      ),
      ...this.marketRegister.stateHuman(raw),
    };
  }

  public get state(): GearboxState {
    return {
      currentBlock: this.currentBlock,
      addressProvider: this.addressProvider.state,
      markets: this.marketRegister.state,
    };
  }

  public async tvl(): Promise<void> {
    const { tvl, tvlUSD } = await this.marketRegister.tvl();
    this.logger?.info(tvl);
    this.logger?.info(`Total TVL: ${formatBN(tvlUSD, 8)}`);
  }

  /**
   * Reloads markets states based on events from last processed block to new block (defaults to latest block)
   * @param opts
   * @returns
   */
  public async syncState(opts?: SyncStateOptions): Promise<void> {
    let { blockNumber, timestamp, skipPriceUpdate } = opts ?? {};
    if (this.#attachConfig?.redstoneHistoricTimestamp) {
      throw new Error(
        "syncState is not supported with redstoneHistoricTimestamp",
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
    this.logger?.debug(`syncing state to block ${blockNumber}...`);

    const watchAddresses = [
      ...Array.from(this.marketRegister.watchAddresses),
      this.addressProvider.address,
    ];
    this.logger?.debug(
      `getting logs from ${watchAddresses.length} addresses in [${this.currentBlock}:${blockNumber}]`,
    );
    const logs = await getLogsSafe(this.provider.publicClient, {
      fromBlock: this.currentBlock,
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

      if (plugin.attach && r.status === "fulfilled") {
        this.logger?.debug(`synced plugin ${name}`);
      } else if (plugin.attach && r.status === "rejected") {
        this.logger?.error(r.reason, `failed to sync plugin ${name}`);
      }
    });

    this.#syncing = false;
    this.logger?.debug(`synced state to block ${blockNumber}`);
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
   * Returns router contract that will work for given credit manager or credit facade
   * @param params
   * @returns
   */
  public routerFor(
    params:
      | { creditManager: Address | BaseState | IBaseContract }
      | { creditFacade: Address | BaseState | IBaseContract },
  ): IRouterContract {
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
    const routerRange: [number, number] =
      facadeV >= 310 ? [310, 319] : [300, 309];
    const routerEntry = this.addressProvider.getLatestInRange(
      AP_ROUTER,
      routerRange,
    );
    if (!routerEntry) {
      throw new Error(
        `router not found for facade v ${facadeV} at ${facadeAddr}`,
      );
    }
    const [routerAddr, routerV] = routerEntry;
    if (!this.contracts.has(routerAddr)) {
      // router is added to this.contracts as constructor's side-effect
      return createRouter(this, routerAddr, routerV);
    }
    return this.contracts.get(routerAddr) as unknown as IRouterContract;
  }
}
