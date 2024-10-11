import type { Address } from "viem";

import { iMarketCompressorAbi } from "../abi";
import type { TokenMetaData } from "../base";
import { SDKConstruct } from "../base";
import {
  ADDRESS_0X0,
  AP_MARKET_COMPRESSOR,
  AP_MARKET_CONFIGURATOR,
} from "../constants";
import type { GearboxSDK } from "../GearboxSDK";
import type { MarketState } from "../state";
import type { ILogger, TVL } from "../types";
import { AddressMap, childLogger } from "../utils";
import type { CreditFactory } from "./CreditFactory";
import { MarketConfiguratorContract } from "./MarketConfiguratorContract";
import { MarketFactory } from "./MarketFactory";
import type { PoolFactory } from "./PoolFactory";

export class MarketRegister extends SDKConstruct {
  #logger?: ILogger;
  #curators?: Address[];
  /**
   * Mapping pool.address -> MarketFactory
   */
  #markets = new AddressMap<MarketFactory>();
  /**
   * Token metadata such as symbol and decimals, common across all markets
   */
  public readonly tokensMeta: AddressMap<TokenMetaData> = new AddressMap();
  // TODO: MarketRegister can be this contract, but v3.0 does not have it
  public readonly marketConfigurator: MarketConfiguratorContract;

  constructor(sdk: GearboxSDK) {
    super(sdk);
    this.#logger = childLogger("MarketRegister", sdk.logger);
    const mkAddr = this.sdk.addressProvider.getLatestVersion(
      AP_MARKET_CONFIGURATOR,
    );
    this.marketConfigurator = new MarketConfiguratorContract(sdk, mkAddr);
  }

  public async loadMarkets(curators: Address[]): Promise<void> {
    this.#curators = curators;
    await this.#loadMarkets(curators, []);
  }

  public async syncState(): Promise<void> {
    if (this.marketConfigurator.dirty) {
      await this.#loadMarkets(this.curators, []);
      return;
    }
    // get addresses of dirty pools
    const pools = this.markets
      .filter(m => m.dirty)
      .map(m => m.poolFactory.pool.address);
    if (pools.length) {
      await this.#loadMarkets([], pools);
    }
  }

  async #loadMarkets(curators: Address[], pools: Address[]): Promise<void> {
    this.#logger?.debug("loading markets");

    const marketCompressorAddress = this.sdk.addressProvider.getAddress(
      AP_MARKET_COMPRESSOR,
      3_10,
    );
    const markets = await this.sdk.provider.publicClient.readContract({
      address: marketCompressorAddress,
      abi: iMarketCompressorAbi,
      functionName: "getMarkets",
      args: [
        {
          curators,
          pools,
          underlying: ADDRESS_0X0,
        },
      ],
      // It's passed as ...rest in viem readContract action, but this might change
      // @ts-ignore
      gas: 500_000_000n,
    });

    for (const data of markets) {
      this.#markets.upsert(
        data.pool.baseParams.addr,
        new MarketFactory(this.sdk, data),
      );
    }

    this.#logger?.info(`loaded ${markets.length} markets`);
  }

  public get state(): MarketState[] {
    return this.markets.map(market => market.state);
  }

  public get pools(): PoolFactory[] {
    return this.markets.map(market => market!.poolFactory);
  }

  public get creditManagers(): CreditFactory[] {
    return this.markets.flatMap(market => market!.creditManagers);
  }

  public findCreditManager(creditManager: Address): CreditFactory {
    for (const market of this.markets) {
      for (const cm of market.creditManagers) {
        if (cm.creditManager.address === creditManager) {
          return cm;
        }
      }
    }
    throw new Error(`cannot find credit manager ${creditManager}`);
  }

  public findByCreditManager(creditManager: Address): MarketFactory {
    const market = this.markets.find(m =>
      m.creditManagers.some(
        cm =>
          cm.creditManager.address.toLowerCase() ===
          creditManager.toLowerCase(),
      ),
    );
    if (!market) {
      throw new Error(`cannot find market for credit manager ${creditManager}`);
    }
    return market;
  }

  public get markets(): MarketFactory[] {
    return Object.values(this.#markets);
  }

  public async tvl(): Promise<TVL> {
    const creditManagers = this.creditManagers;
    const tvls = await Promise.all(creditManagers.map(cm => cm.tvl()));
    return tvls.reduce(
      (acc, curr) => {
        acc.tvl += curr.tvl;
        acc.tvlUSD += curr.tvlUSD;
        return acc;
      },
      { tvl: 0n, tvlUSD: 0n },
    );
  }

  public get curators(): Address[] {
    if (!this.#curators) {
      throw new Error(`market register has no markets loaded`);
    }
    return this.#curators;
  }
}
