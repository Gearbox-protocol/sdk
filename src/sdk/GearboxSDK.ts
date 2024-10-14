import type { Address, Hex } from "viem";
import { createPublicClient, http, parseEventLogs } from "viem";

import type { BaseContract } from "./base";
import type { NetworkType } from "./chain";
import { Provider } from "./chain";
import {
  ADDRESS_PROVIDER,
  AP_BOT_LIST,
  AP_GEAR_STAKING,
  AP_GEAR_TOKEN,
  AP_ROUTER,
  TIMELOCK,
} from "./constants";
import {
  AddressProviderContractV3_1,
  BotListContract,
  GearStakingContract,
} from "./core";
import { MarketRegister } from "./market/MarketRegister";
import { PriceFeedRegister } from "./market/pricefeeds";
import { RouterV3Contract } from "./router";
import type { GearboxState } from "./state/state";
import type { ILogger, MultiCall } from "./types";
import { AddressMap, formatBN } from "./utils";
import { detectNetwork } from "./utils/viem";

export interface SDKAttachOptions {
  /**
   * Account address for contract write simulations
   */
  account?: Address;
  /**
   * RPC URL (and fallbacks) to use
   */
  rpcURLs: string[];
  /**
   * RPC client timeout in milliseconds
   */
  timeout?: number;
  /**
   * Actual chain id of rpc, if not set, will be determined
   */
  chainId?: number;
  /**
   * If not set, will be detected automatically
   */
  networkType?: NetworkType;
  /**
   * If not set, address provider address is determinted automatically from networkType
   */
  addressProvider?: Address;
  /**
   * Risk curators, defaults to gearbox own
   */
  riskCurators?: Address[];
  /**
   * Bring your own logger
   */
  logger?: ILogger;
}

interface SDKOptions {
  provider: Provider;
  logger?: ILogger;
}

export class GearboxSDK {
  // Represents chain object
  readonly #provider: Provider;

  // Block which was use for data query
  #currentBlock?: bigint;
  #timestamp?: bigint;
  #syncing = false;

  #gear?: Address;

  // Collection of core singleton contracts
  #addressProvider?: AddressProviderContractV3_1;
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

  public static async attach(options: SDKAttachOptions): Promise<GearboxSDK> {
    const { rpcURLs, timeout, logger, riskCurators } = options;
    let { networkType, addressProvider, chainId } = options;
    if (rpcURLs.length === 0) {
      throw new Error("please specify at least one rpc url");
    }
    const attachClient = createPublicClient({
      transport: http(rpcURLs[0], { timeout }),
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
      chainId,
      networkType,
      rpcURLs,
      timeout,
    });
    logger?.debug(
      { networkType, chainId, addressProvider },
      "attaching gearbox sdk",
    );

    return new GearboxSDK({
      provider,
      logger,
    }).#attach(addressProvider, riskCurators);
  }

  private constructor(options: SDKOptions) {
    this.#provider = options.provider;
    this.logger = options.logger;
    this.priceFeeds = new PriceFeedRegister(this);
  }

  async #attach(
    addressProviderAddress: Address,
    riskCurators?: Address[],
  ): Promise<this> {
    const time = Date.now();

    await this.updateBlock();

    this.logger?.info("Attaching to address provider", addressProviderAddress);
    this.#addressProvider = new AddressProviderContractV3_1(
      this,
      addressProviderAddress,
    );
    await this.#addressProvider.fetchState(this.currentBlock);

    // Attaching bot list contract
    const botListAddress = this.#addressProvider.getAddress(AP_BOT_LIST, 300);
    this.#botListContract = new BotListContract(this, botListAddress);
    await this.#botListContract.fetchState(this.currentBlock);

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
      riskCurators ?? [TIMELOCK[this.provider.networkType]],
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
    // todo: fallback to 4bytes directory
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

  public async updateBlock(): Promise<void> {
    const block = await this.provider.publicClient.getBlock({
      blockTag: "latest",
    });
    this.#currentBlock = block.number;
    this.#timestamp = block.timestamp;
  }

  public get state(): GearboxState {
    return {
      block: Number(this.currentBlock),
      timestamp: Number(this.timestamp),
      core: {
        addressProviderV3: this.addressProvider.state,
        botList: this.botListContract.state,
        gearStakingV3: this.gearStakingContract.state,
      },
      markets: this.marketRegister.state,
      // routerState: this.#router?.state,
      contractLabels: this.provider.addressLabels.all,
    };
  }

  public async tvl(): Promise<void> {
    const { tvl, tvlUSD } = await this.marketRegister.tvl();
    this.logger?.info(tvl);
    this.logger?.info(`Total TVL: ${formatBN(tvlUSD, 8)}`);
  }

  // TODO: timestamp is annoying - need to make second request to get block timestamp
  // TODO: make flag to prevent double syncing
  public async syncState(toBlock: bigint, timestamp: bigint): Promise<void> {
    if (toBlock <= this.currentBlock || this.#syncing) {
      return;
    }
    this.#syncing = true;
    this.logger?.debug(`syncing state to block ${toBlock}...`);

    const logs = await this.provider.publicClient.getLogs({
      fromBlock: BigInt(this.currentBlock),
      toBlock: BigInt(toBlock),
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

    this.#currentBlock = toBlock;
    this.#timestamp = timestamp;
    this.#syncing = false;
    this.logger?.debug(`synced state to block ${toBlock}`);
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

  public get addressProvider(): AddressProviderContractV3_1 {
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