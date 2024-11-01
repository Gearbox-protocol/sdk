import type { Address } from "viem";
import { getAddress } from "viem";

import { iMarketCompressorAbi } from "../abi";
import type { MarketData } from "../base";
import { SDKConstruct } from "../base";
import {
  ADDRESS_0X0,
  AP_MARKET_COMPRESSOR,
  AP_MARKET_CONFIGURATOR,
} from "../constants";
import type { GearboxSDK } from "../GearboxSDK";
import type { ILogger, MarketStateHuman, TVL } from "../types";
import { AddressMap, childLogger } from "../utils";
import { simulateMulticall } from "../utils/viem";
import type { CreditFactory } from "./CreditFactory";
import { MarketConfiguratorContract } from "./MarketConfiguratorContract";
import { MarketFactory } from "./MarketFactory";
import type { PoolFactory } from "./PoolFactory";
import { rawTxToMulticallPriceUpdate } from "./pricefeeds";

export class MarketRegister extends SDKConstruct {
  #logger?: ILogger;
  #curators?: Address[];
  /**
   * Mapping pool.address -> MarketFactory
   */
  #markets = new AddressMap<MarketFactory>();
  // TODO: MarketRegister can be this contract, but v3.0 does not have it
  public readonly marketConfigurator?: MarketConfiguratorContract;

  constructor(sdk: GearboxSDK) {
    super(sdk);
    this.#logger = childLogger("MarketRegister", sdk.logger);
    try {
      const mkAddr = this.sdk.addressProvider.getLatestVersion(
        AP_MARKET_CONFIGURATOR,
      );
      this.marketConfigurator = new MarketConfiguratorContract(sdk, mkAddr);
    } catch (e) {
      this.#logger?.warn(e);
    }
  }

  public async loadMarkets(curators: Address[]): Promise<void> {
    this.#curators = curators;
    await this.#loadMarkets(curators, []);
  }

  public async syncState(): Promise<void> {
    if (this.marketConfigurator?.dirty) {
      this.#logger?.debug(`need to reload all markets`);
      await this.#loadMarkets(this.curators, []);
      return;
    }
    // get addresses of dirty pools
    const pools = this.markets
      .filter(m => m.dirty)
      .map(m => m.poolFactory.pool.address);
    if (pools.length) {
      this.#logger?.debug(`need to reload ${pools.length} markets`);
      await this.#loadMarkets([], pools);
    }
  }

  async #loadMarkets(curators: Address[], pools: Address[]): Promise<void> {
    const marketCompressorAddress = this.sdk.addressProvider.getAddress(
      AP_MARKET_COMPRESSOR,
      3_10,
    );
    // to have correct prices we must first get all updatable price feeds
    await this.sdk.priceFeeds.loadUpdatablePriceFeeds(curators, pools);
    // the generate updates
    const { txs } = await this.sdk.priceFeeds.generatePriceFeedsUpdateTxs();
    // ...and push them using multicall before getting answers
    const resp = await simulateMulticall(this.provider.publicClient, {
      contracts: [
        ...txs.map(rawTxToMulticallPriceUpdate),
        {
          abi: iMarketCompressorAbi,
          address: marketCompressorAddress,
          functionName: "getMarkets",
          args: [
            {
              curators,
              pools,
              underlying: ADDRESS_0X0,
            },
          ],
        },
      ],
      allowFailure: false,
      gas: 550_000_000n,
      batchSize: 0, // we cannot have price updates and compressor request in different batches
    });

    const markets = resp.pop() as MarketData[];

    for (const data of markets) {
      this.#markets.upsert(
        data.pool.baseParams.addr,
        new MarketFactory(this.sdk, data),
      );
    }

    this.#logger?.info(`loaded ${markets.length} markets`);
  }

  /**
   * Loads new prices and price feeds for given oracles from PriceFeedCompressor, defaults to all oracles
   * Supports v300 and v310 oracles
   */
  public async updatePrices(oracles?: Address[]): Promise<void> {
    const multicalls = this.markets
      .map(m => m.priceOracle)
      .filter(o => !oracles || oracles.includes(o.address))
      .map(o => o.syncStateMulticall());
    if (!multicalls.length) {
      return;
    }
    const { txs } = await this.sdk.priceFeeds.generatePriceFeedsUpdateTxs();
    const resp = await simulateMulticall(this.provider.publicClient, {
      contracts: [
        ...txs.map(rawTxToMulticallPriceUpdate),
        ...multicalls.map(mc => mc.call),
      ],
      allowFailure: false,
      gas: 550_000_000n,
      batchSize: 0, // we cannot have price updates and compressor request in different batches
    });
    const oraclesStates = resp.slice(txs.length);
    for (let i = 0; i < multicalls.length; i++) {
      const handler = multicalls[i].onResult;
      const result = oraclesStates[i] as any;
      handler(result);
    }
  }

  public get state(): MarketData[] {
    return this.markets.map(market => market.state);
  }

  public stateHuman(raw = true): MarketStateHuman[] {
    return this.markets.map(market => market.stateHuman(raw));
  }

  public get pools(): PoolFactory[] {
    return this.markets.map(market => market!.poolFactory);
  }

  public get creditManagers(): CreditFactory[] {
    return this.markets.flatMap(market => market!.creditManagers);
  }

  public findCreditManager(creditManager: Address): CreditFactory {
    const addr = creditManager.toLowerCase();
    for (const market of this.markets) {
      for (const cm of market.creditManagers) {
        if (cm.creditManager.address.toLowerCase() === addr) {
          return cm;
        }
      }
    }
    throw new Error(`cannot find credit manager ${creditManager}`);
  }

  public findByCreditManager(creditManager: Address): MarketFactory {
    const addr = creditManager.toLowerCase();
    const market = this.markets.find(m =>
      m.creditManagers.some(
        cm => cm.creditManager.address.toLowerCase() === addr,
      ),
    );
    if (!market) {
      throw new Error(`cannot find market for credit manager ${creditManager}`);
    }
    return market;
  }

  public findByPriceOracle(address: Address): MarketFactory {
    const addr = address.toLowerCase();
    for (const market of this.markets) {
      if (market.priceOracle.address.toLowerCase() === addr) {
        return market;
      }
    }
    throw new Error(`cannot find price oracle ${address}`);
  }

  public get marketsMap() {
    return this.#markets;
  }

  public get markets(): MarketFactory[] {
    return this.#markets.values();
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
