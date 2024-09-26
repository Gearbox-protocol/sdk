import {
  ADDRESS_PROVIDER,
  formatBN,
  TIMELOCK,
} from "@gearbox-protocol/sdk-gov";
import { type Address, http } from "viem";

import { CreditAccountCompressorV3Contract } from "../contracts/periphery/CreditAccountCompressorV3Contract";
import { MarketCompressorV3Contract } from "../contracts/periphery/MarketCompressorV3Contract";
import {
  AP_BOT_LIST,
  AP_CREDIT_ACCOUNT_COMPRESSOR,
  AP_GEAR_STAKING,
  AP_GEAR_TOKEN,
  AP_MARKET_COMPRESSOR,
  AP_ROUTER,
} from "../core/addresses";
import { RouterFactoryDeploy } from "../factories/RouterFactoryDeploy";
import { getAddressProvider } from "../utils/get-address-provider";
import { BaseContract } from "./base/BaseContract";
import type { NetworkType } from "./chain";
import { Provider } from "./chain/Provider";
import { AddressProviderContractV3_1 } from "./core/AddressProviderV3_1Contract";
import { BotListContract } from "./core/BotListV3Contract";
import { GearStakingContract } from "./core/GearStakingV3Contract";
import { MarketRegister } from "./market/MarketRegister";
import type { GearboxState } from "./state/state";
import { createAnvilClient } from "./utils/viem";

export interface SDKOptions {
  /**
   * RPC URL to use
   */
  rpcURL: string;
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
   * RPC client timeout in milliseconds
   */
  timeout?: number;
}

export class GearboxSDK {
  // Represents chain object
  public readonly provider: Provider;

  // Block which was use for data query
  currentBlock: bigint;
  timestamp: bigint;

  gear: Address;

  // Collection of core singleton contracts
  addressProvider: AddressProviderContractV3_1;
  botListContract: BotListContract;
  gearStakingContract: GearStakingContract;

  // Collection of markets
  marketRegister: MarketRegister;

  // Collection of periphery contracts
  marketCompressor: MarketCompressorV3Contract | undefined;
  creditAccountCompressor: CreditAccountCompressorV3Contract | undefined;

  // Router contract
  routerFactory: RouterFactoryDeploy | undefined;

  public static async attach(options: SDKOptions): Promise<GearboxSDK> {
    const { rpcURL, timeout = 120_000 } = options;
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

    const service = new GearboxSDK({
      addressProvider,
      chainId,
      networkType,
      rpcURL,
      timeout,
    });
    await service.attach();
    return service;
  }

  constructor(options: Required<SDKOptions>) {
    this.provider = new Provider(options);
  }

  async updateBlock() {
    const block = await this.provider.publicClient.getBlock({
      blockTag: "latest",
    });

    this.currentBlock = block.number;
    this.timestamp = block.timestamp;
  }

  protected async attach() {
    const time = Date.now();

    await this.updateBlock();

    // Attaching address provider contract

    const addressProviderAddress = getAddressProvider(
      this.provider.networkType,
    );

    this.provider.logger.info(
      "Attaching to address provider",
      addressProviderAddress,
    );

    this.addressProvider = new AddressProviderContractV3_1({
      address: addressProviderAddress,
      chainClient: this.provider,
    });

    await this.addressProvider.fetchState(this.currentBlock);

    // Getting gear token address
    this.gear = this.addressProvider.getAddress(AP_GEAR_TOKEN);

    // Attaching bot list contract
    const botListAddress = this.addressProvider.getAddress(AP_BOT_LIST, 300);

    this.botListContract = new BotListContract({
      address: botListAddress,
      chainClient: this.provider,
    });

    await this.botListContract.fetchState(this.currentBlock);

    // Attaching gear staking contract
    const gearStakingAddress = this.addressProvider.getAddress(
      AP_GEAR_STAKING,
      300,
    );

    this.gearStakingContract = new GearStakingContract({
      address: gearStakingAddress,
      chainClient: this.provider,
    });

    // Attaching market compressor
    const marketCompressorAddress = this.addressProvider.getAddress(
      AP_MARKET_COMPRESSOR,
      3_10,
    );

    this.marketCompressor = new MarketCompressorV3Contract({
      address: marketCompressorAddress,
      chainClient: this.provider,
    });

    // Attaching credit account compressor
    const creditAccountCompressorAddress = this.addressProvider.getAddress(
      AP_CREDIT_ACCOUNT_COMPRESSOR,
      3_10,
    );

    this.creditAccountCompressor = new CreditAccountCompressorV3Contract({
      address: creditAccountCompressorAddress,
      chainClient: this.provider,
    });

    this.marketRegister = new MarketRegister(this);

    console.log("Loading markets");

    await this.marketRegister.loadMarkets([TIMELOCK.Mainnet]);

    console.log("Markets loaded");

    try {
      const router = this.addressProvider.getLatestVersion(AP_ROUTER);
      this.routerFactory = await RouterFactoryDeploy.attach(router, this);
    } catch (e) {
      this.provider.logger.warn("Router not found", e);
    }

    this.provider.logger.info(
      `MgmtService attach time: ${Date.now() - time} ms`,
    );
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
      routerState: this.routerFactory?.state,
      contractLabels: this.provider.addressLabels.all,
    };
  }

  async tvl() {
    const { tvl, tvlUSD } = await this.marketRegister.tvl();

    this.provider.logger.info(tvl);
    this.provider.logger.info(`Total TVL: ${formatBN(tvlUSD, 8)}`);
  }

  async syncState(toBlock: bigint, timestamp: bigint) {
    if (toBlock <= this.currentBlock) return;

    this.provider.logger.debug(`Syncing state to block ${toBlock}`);

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
    this.currentBlock = toBlock;
    this.timestamp = timestamp;
  }
}
