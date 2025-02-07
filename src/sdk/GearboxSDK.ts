import type { Address, Hex } from "viem";
import { createPublicClient, parseEventLogs } from "viem";

import type { BaseContract } from "./base";
import { TokensMeta } from "./base";
import type {
  ConnectionOptions,
  NetworkOptions,
  TransportOptions,
} from "./chain";
import { createTransport, Provider } from "./chain";
import {
  ADDRESS_PROVIDER,
  AP_BOT_LIST,
  AP_GEAR_STAKING,
  AP_GEAR_TOKEN,
  AP_ROUTER,
} from "./constants";
import type { IAddressProviderContract } from "./core";
import {
  BotListContract,
  GearStakingContract,
  getAddressProvider,
} from "./core";
import { MarketRegister } from "./market/MarketRegister";
import { PriceFeedRegister } from "./market/pricefeeds";
import { RouterV3Contract } from "./router";
import type {
  GearboxState,
  GearboxStateHuman,
  ILogger,
  MultiCall,
} from "./types";
import { AddressMap, formatBN } from "./utils";
import { Hooks } from "./utils/internal";
import { detectNetwork } from "./utils/viem";

export interface SDKOptions {
  /**
   * If not set, address provider address is determinted automatically from networkType
   */
  addressProvider?: Address;
  /**
   * Market configurators
   */
  marketConfigurators: Address[];
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
   * Bring your own logger
   */
  logger?: ILogger;
}

interface SDKContructorArgs {
  provider: Provider;
  logger?: ILogger;
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
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type SDKHooks = {
  syncState: [];
};

export class GearboxSDK {
  readonly #hooks = new Hooks<SDKHooks>();
  // Represents chain object
  readonly #provider: Provider;

  // Block which was use for data query
  #currentBlock?: bigint;
  #timestamp?: bigint;
  #syncing = false;

  #gear?: Address;

  // Collection of core singleton contracts
  #addressProvider?: IAddressProviderContract;
  #botListContract?: BotListContract;
  #gearStakingContract?: GearStakingContract;

  // Collection of markets
  #marketRegister?: MarketRegister;

  // Router contract
  #router?: RouterV3Contract;

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
   * All contracts known to sdk
   */
  public readonly contracts = new AddressMap<BaseContract<any>>();
  /**
   * Token metadata such as symbol and decimals
   */
  public readonly tokensMeta = new TokensMeta();

  public addHook = this.#hooks.addHook.bind(this.#hooks);
  public removeHook = this.#hooks.removeHook.bind(this.#hooks);

  public static async attach(
    options: SDKOptions &
      Partial<NetworkOptions> &
      ConnectionOptions &
      TransportOptions,
  ): Promise<GearboxSDK> {
    const {
      logger,
      blockNumber,
      redstoneHistoricTimestamp,
      ignoreUpdateablePrices,
      marketConfigurators,
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
      addressProvider = ADDRESS_PROVIDER[networkType];
    }

    const provider = new Provider({
      ...options,
      chainId,
      networkType,
    });
    logger?.debug(
      { networkType, chainId, addressProvider, marketConfigurators },
      "attaching gearbox sdk",
    );

    return new GearboxSDK({
      provider,
      logger,
    }).#attach({
      addressProvider,
      blockNumber,
      redstoneHistoricTimestamp,
      ignoreUpdateablePrices,
      marketConfigurators,
    });
  }

  private constructor(options: SDKContructorArgs) {
    this.#provider = options.provider;
    this.logger = options.logger;
    this.priceFeeds = new PriceFeedRegister(this);
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

    this.logger?.info(
      {
        addressProvider,
        blockNumber: block.number,
        timestamp: block.timestamp,
      },
      "attaching",
    );
    this.#addressProvider = await getAddressProvider(this, addressProvider);
    this.logger?.debug(
      `address provider version: ${this.#addressProvider.version}`,
    );
    await this.#addressProvider.syncState(this.currentBlock);

    // Attaching bot list contract
    const botListAddress = this.#addressProvider.getAddress(AP_BOT_LIST, 300);
    this.#botListContract = new BotListContract(this, botListAddress);

    // Attaching gear staking contract
    this.#gear = this.#addressProvider.getAddress(AP_GEAR_TOKEN);
    const gearStakingAddress = this.#addressProvider.getAddress(
      AP_GEAR_STAKING,
      300,
    );
    this.#gearStakingContract = new GearStakingContract(
      this,
      gearStakingAddress,
    );

    this.#marketRegister = new MarketRegister(this);
    await this.#marketRegister.loadMarkets(
      marketConfigurators,
      ignoreUpdateablePrices,
    );

    try {
      const router = this.#addressProvider.getLatestVersion(AP_ROUTER);
      this.#router = new RouterV3Contract(this, router);
    } catch (e) {
      this.logger?.warn("Router not found", e);
    }

    this.logger?.info(`attach time: ${Date.now() - time} ms`);

    return this;
  }

  /**
   * Converts contract call into some human-friendly string
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
        botList: this.botListContract.stateHuman(raw),
        gearStakingV3: this.gearStakingContract.stateHuman(raw),
      },
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
    let { blockNumber, timestamp } = opts ?? {};
    if (!blockNumber) {
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

    const logs = await this.provider.publicClient.getLogs({
      fromBlock: this.currentBlock,
      toBlock: blockNumber,
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

    // This will reload all or some markets
    await this.marketRegister.syncState();
    // TODO: do wee need to sync state on botlist and others?

    this.#currentBlock = blockNumber;
    this.#timestamp = timestamp;
    await this.#hooks.triggerHooks("syncState");
    this.#syncing = false;
    this.logger?.debug(`synced state to block ${blockNumber}`);
  }

  public get provider(): Provider {
    return this.#provider;
  }

  public get currentBlock(): bigint {
    if (this.#currentBlock === undefined) {
      throw new Error("Gearbox SDK not attached");
    }
    return this.#currentBlock;
  }

  public get timestamp(): bigint {
    if (this.#timestamp === undefined) {
      throw new Error("Gearbox SDK not attached");
    }
    return this.#timestamp;
  }

  public get gear(): Address {
    if (this.#gear === undefined) {
      throw new Error("Gearbox SDK not attached");
    }
    return this.#gear;
  }

  public get addressProvider(): IAddressProviderContract {
    if (this.#addressProvider === undefined) {
      throw new Error("Gearbox SDK not attached");
    }
    return this.#addressProvider;
  }

  public get botListContract(): BotListContract {
    if (this.#botListContract === undefined) {
      throw new Error("Gearbox SDK not attached");
    }
    return this.#botListContract;
  }

  public get gearStakingContract(): GearStakingContract {
    if (this.#gearStakingContract === undefined) {
      throw new Error("Gearbox SDK not attached");
    }
    return this.#gearStakingContract;
  }

  public get marketRegister(): MarketRegister {
    if (this.#marketRegister === undefined) {
      throw new Error("Gearbox SDK not attached");
    }
    return this.#marketRegister;
  }

  public get router(): RouterV3Contract {
    if (this.#router === undefined) {
      throw new Error("Gearbox SDK not attached");
    }
    return this.#router;
  }
}
