import type { Address } from "viem";

import {
  iGaugeCompressorAbi,
  iMarketCompressorAbi,
  iPeripheryCompressorAbi,
} from "../abi";
import type { GaugeData, MarketData, MarketFilter, ZapperData } from "../base";
import { SDKConstruct } from "../base";
import {
  ADDRESS_0X0,
  AP_GAUGE_COMPRESSOR,
  AP_MARKET_COMPRESSOR,
  AP_PERIPHERY_COMPRESSOR,
} from "../constants";
import type { GearboxSDK } from "../GearboxSDK";
import type {
  ILogger,
  MarketStateHuman,
  RawTx,
  TVL,
  ZapperStateHuman,
} from "../types";
import { AddressMap, childLogger } from "../utils";
import { simulateMulticall } from "../utils/viem";
import type { CreditSuite } from "./CreditSuite";
import type { MarketConfiguratorContract } from "./MarketConfiguratorContract";
import { MarketSuite } from "./MarketSuite";
import type { PoolSuite } from "./PoolSuite";
import { rawTxToMulticallPriceUpdate } from "./pricefeeds";

export interface ZapperDataFull extends ZapperData {
  pool: Address;
}

export class MarketRegister extends SDKConstruct {
  #logger?: ILogger;
  /**
   * Mapping pool.address -> MarketSuite
   */
  #markets = new AddressMap<MarketSuite>();
  #zappers = new AddressMap<Array<ZapperDataFull>>();

  #marketFilter?: MarketFilter;

  constructor(sdk: GearboxSDK, markets?: MarketData[]) {
    super(sdk);
    this.#logger = childLogger("MarketRegister", sdk.logger);
    for (const data of markets ?? []) {
      this.#markets.upsert(
        data.pool.baseParams.addr,
        new MarketSuite(this.sdk, data),
      );
    }
  }

  public async loadMarkets(
    marketConfigurators: Address[],
    ignoreUpdateablePrices?: boolean,
  ): Promise<void> {
    if (!marketConfigurators.length) {
      this.#logger?.warn(
        "no market configurators provided, skipping loadMarkets",
      );
      return;
    }
    await this.#loadMarkets(marketConfigurators, [], ignoreUpdateablePrices);
  }

  public async loadZappers(): Promise<void> {
    const pcAddr = this.sdk.addressProvider.getAddress(
      AP_PERIPHERY_COMPRESSOR,
      3_10,
    );
    this.#logger?.debug(`loading zappers with periphery compressor ${pcAddr}`);
    const resp = await this.provider.publicClient.multicall({
      contracts: this.markets.map(m => ({
        abi: iPeripheryCompressorAbi,
        address: pcAddr,
        functionName: "getZappers",
        args: [m.configurator.address, m.pool.pool.address],
      })),
      allowFailure: true,
    });

    for (let i = 0; i < resp.length; i++) {
      const { status, result, error } = resp[i];
      const marketConfigurator = this.markets[i].configurator.address;
      const pool = this.markets[i].pool.pool.address;

      if (status === "success") {
        const list = result as any as ZapperData[];

        this.#zappers.upsert(
          pool,
          list.map(z => ({ ...z, pool })),
        );
      } else {
        this.#logger?.error(
          `failed to load zapper for market configurator ${this.labelAddress(marketConfigurator)} and pool ${this.labelAddress(pool)}: ${error}`,
        );
      }
    }

    const zappersTokens = this.#zappers
      .values()
      .flatMap(l => l.flatMap(z => [z.tokenIn, z.tokenOut]));
    for (const t of zappersTokens) {
      this.sdk.tokensMeta.upsert(t.addr, t);
      this.sdk.provider.addressLabels.set(t.addr as Address, t.symbol);
    }
  }

  public async getGauges(staker: Address): Promise<GaugeData[]> {
    const gcAddr =
      this.sdk.addressProvider.getLatestVersion(AP_GAUGE_COMPRESSOR);
    if (!this.#marketFilter) {
      throw new Error("market filter is not set");
    }
    const resp = await this.provider.publicClient.readContract({
      abi: iGaugeCompressorAbi,
      address: gcAddr,
      functionName: "getGauges",
      args: [this.#marketFilter, staker],
    });
    return [...resp];
  }

  public async getGauge(gauge: Address, staker: Address): Promise<GaugeData> {
    const gcAddr =
      this.sdk.addressProvider.getLatestVersion(AP_GAUGE_COMPRESSOR);
    if (!this.#marketFilter) {
      throw new Error("market filter is not set");
    }
    const resp = await this.provider.publicClient.readContract({
      abi: iGaugeCompressorAbi,
      address: gcAddr,
      functionName: "getGauge",
      args: [gauge, staker],
    });
    return resp;
  }

  public async syncState(): Promise<void> {
    const pools = this.markets
      .filter(m => m.dirty)
      .map(m => m.pool.pool.address);
    if (pools.length) {
      this.#logger?.debug(`need to reload ${pools.length} markets`);
      await this.#loadMarkets([], pools);
    }
  }

  async #loadMarkets(
    configurators: Address[],
    pools: Address[],
    ignoreUpdateablePrices?: boolean,
  ): Promise<void> {
    this.#marketFilter = {
      configurators,
      pools,
      underlying: ADDRESS_0X0,
    };
    const marketCompressorAddress = this.sdk.addressProvider.getAddress(
      AP_MARKET_COMPRESSOR,
      3_10,
    );
    let txs: RawTx[] = [];
    if (!ignoreUpdateablePrices) {
      // to have correct prices we must first get all updatable price feeds
      await this.sdk.priceFeeds.preloadUpdatablePriceFeeds(
        configurators,
        pools,
      );
      // the generate updates
      const updates = await this.sdk.priceFeeds.generatePriceFeedsUpdateTxs();
      txs = updates.txs;
    }
    this.#logger?.debug(
      { configurators, pools },
      `calling getMarkets with ${txs.length} price updates`,
    );
    // ...and push them using multicall before getting answers
    let markets: readonly MarketData[] = [];
    if (txs.length) {
      const resp = await simulateMulticall(this.provider.publicClient, {
        contracts: [
          ...txs.map(rawTxToMulticallPriceUpdate),
          {
            abi: iMarketCompressorAbi,
            address: marketCompressorAddress,
            functionName: "getMarkets",
            args: [this.#marketFilter],
          },
        ],
        allowFailure: false,
        // gas: 550_000_000n,
        batchSize: 0, // we cannot have price updates and compressor request in different batches
      });
      markets = resp.pop() as MarketData[];
    } else {
      markets = await this.provider.publicClient.readContract({
        abi: iMarketCompressorAbi,
        address: marketCompressorAddress,
        functionName: "getMarkets",
        args: [this.#marketFilter],
        // gas: 550_000_000n,
      });
    }

    for (const data of markets) {
      this.#markets.upsert(
        data.pool.baseParams.addr,
        new MarketSuite(this.sdk, data),
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
      // gas: 550_000_000n,
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

  public stateHuman(raw = true): {
    markets: MarketStateHuman[];
    zappers: ZapperStateHuman[];
  } {
    return {
      markets: this.markets.map(market => market.stateHuman(raw)),
      zappers: this.zappers.values().flatMap(l =>
        l.flatMap(z => ({
          address: z.baseParams.addr,
          contractType: z.baseParams.contractType,
          version: Number(z.baseParams.version),
          tokenIn: this.labelAddress(z.tokenIn.addr),
          tokenOut: this.labelAddress(z.tokenOut.addr),
        })),
      ),
    };
  }

  public get pools(): PoolSuite[] {
    return this.markets.map(market => market.pool);
  }

  public get creditManagers(): CreditSuite[] {
    return this.markets.flatMap(market => market.creditManagers);
  }

  public get marketConfigurators(): MarketConfiguratorContract[] {
    const result = new Set<MarketConfiguratorContract>();
    for (const m of this.markets) {
      result.add(m.configurator);
    }
    return Array.from(result);
  }

  public findCreditManager(creditManager: Address): CreditSuite {
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

  public findByCreditManager(creditManager: Address): MarketSuite {
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

  public findByPriceOracle(address: Address): MarketSuite {
    const addr = address.toLowerCase();
    for (const market of this.markets) {
      if (market.priceOracle.address.toLowerCase() === addr) {
        return market;
      }
    }
    throw new Error(`cannot find market for price oracle ${address}`);
  }

  public findByPool(address: Address): MarketSuite {
    const addr = address.toLowerCase();
    for (const market of this.markets) {
      if (market.pool.pool.address.toLowerCase() === addr) {
        return market;
      }
    }
    throw new Error(`cannot find market for pool ${address}`);
  }

  public get marketsMap() {
    return this.#markets;
  }

  public get zappers() {
    return this.#zappers;
  }

  public get markets(): MarketSuite[] {
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
}
