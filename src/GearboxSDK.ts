import type { NetworkType } from "@gearbox-protocol/sdk-gov";
import {
  ADDRESS_PROVIDER,
  formatBN,
  TIMELOCK,
} from "@gearbox-protocol/sdk-gov";
import { type Address, http } from "viem";

import { BaseContract } from "./base";
import { Provider } from "./chain";
import {
  AP_BOT_LIST,
  AP_GEAR_STAKING,
  AP_GEAR_TOKEN,
  AP_ROUTER,
} from "./constants";
import {
  AddressProviderContractV3_1,
  BotListContract,
  GearStakingContract,
} from "./core";
import { MarketRegister } from "./market/MarketRegister";
import { RouterV3Contract } from "./router";
import type { GearboxState } from "./state/state";
import type { ILogger } from "./types";
import { AddressMap, childLogger } from "./utils";
import { createAnvilClient } from "./utils/viem";

export interface SDKAttachOptions {
  /**
   * RPC URL to use
   */
  rpcURL: string;
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
  public readonly provider: Provider;

  // Block which was use for data query
  #currentBlock?: bigint;
  #timestamp?: bigint;

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

  public static async attach(options: SDKAttachOptions): Promise<GearboxSDK> {
    const { rpcURL, timeout, logger } = options;
    let { networkType, addressProvider, chainId } = options;
    const attachClient = createAnvilClient({
      transport: http(rpcURL, { timeout }),
    });
    if (!networkType) {
      networkType = await attachClient.detectNetwork();
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
      rpcURL,
      timeout,
    });

    return new GearboxSDK({
      provider,
      logger,
    }).#attach(addressProvider);
  }

  protected constructor(options: SDKOptions) {
    this.provider = options.provider;
    this.logger = childLogger("sdk", options.logger);
  }

  async #attach(addressProviderAddress: Address): Promise<this> {
    const time = Date.now();

    await this.updateBlock();

    this.logger?.info("Attaching to address provider", addressProviderAddress);
    this.#addressProvider = new AddressProviderContractV3_1({
      address: addressProviderAddress,
      sdk: this,
    });
    await this.#addressProvider.fetchState(this.currentBlock);

    // Attaching bot list contract
    const botListAddress = this.#addressProvider.getAddress(AP_BOT_LIST, 300);
    this.#botListContract = new BotListContract({
      address: botListAddress,
      sdk: this,
    });
    await this.#botListContract.fetchState(this.currentBlock);

    // Attaching gear staking contract
    this.#gear = this.#addressProvider.getAddress(AP_GEAR_TOKEN);
    const gearStakingAddress = this.#addressProvider.getAddress(
      AP_GEAR_STAKING,
      300,
    );
    this.#gearStakingContract = new GearStakingContract({
      address: gearStakingAddress,
      sdk: this,
    });

    this.#marketRegister = new MarketRegister(this);
    await this.#marketRegister.loadMarkets([TIMELOCK.Mainnet]);

    try {
      const router = this.#addressProvider.getLatestVersion(AP_ROUTER);
      this.#router = new RouterV3Contract(router, this);
    } catch (e) {
      this.logger?.warn("Router not found", e);
    }

    this.logger?.info(`attach time: ${Date.now() - time} ms`);

    return this;
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

  public async syncState(toBlock: bigint, timestamp: bigint): Promise<void> {
    if (toBlock <= this.currentBlock) {
      return;
    }

    this.logger?.debug(`Syncing state to block ${toBlock}`);

    const events = await this.provider.publicClient.getLogs({
      fromBlock: BigInt(this.currentBlock),
      toBlock: BigInt(toBlock),
    });

    BaseContract.parseLogs(events);

    for (const pf of this.marketRegister.getPoolFactories()) {
      if (pf.poolContract.hasOperation) {
        // await pf.poolContract.syncState();
      }
    }

    // TODO: @Kostya, check how to update prices
    // await this.priceFeedFactory.updatePrices();

    // TODO: add cm reload tracking
    this.#currentBlock = toBlock;
    this.#timestamp = timestamp;
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
