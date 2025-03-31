import type { Address } from "viem";

import { iMarketCompressorAbi } from "../../abi/compressors.js";
import type { MarketData, MarketFilter } from "../base/index.js";
import { SDKConstruct } from "../base/index.js";
import { ADDRESS_0X0, AP_MARKET_COMPRESSOR } from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type {
  ILogger,
  IPriceUpdateTx,
  MarketStateHuman,
  TVL,
} from "../types/index.js";
import { AddressMap, childLogger } from "../utils/index.js";
import { simulateWithPriceUpdates } from "../utils/viem/index.js";
import type { CreditSuite } from "./credit/index.js";
import type { MarketConfiguratorContract } from "./MarketConfiguratorContract.js";
import { MarketSuite } from "./MarketSuite.js";
import type { PoolSuite } from "./pool/index.js";

export class MarketRegister extends SDKConstruct {
  #logger?: ILogger;
  /**
   * Mapping pool.address -> MarketSuite
   */
  #markets = new AddressMap<MarketSuite>(undefined, "markets");

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

  get marketFilter() {
    return this.#marketFilter;
  }

  public async syncState(skipPriceUpdate?: boolean): Promise<void> {
    const dirtyPools: Address[] = [];
    const nonDirtyOracles: Address[] = [];

    for (const m of this.markets) {
      if (m.dirty) {
        dirtyPools.push(m.pool.pool.address);
      } else {
        nonDirtyOracles.push(m.priceOracle.address);
      }
    }

    if (dirtyPools.length) {
      this.#logger?.debug(`need to reload ${dirtyPools.length} markets`);
      // this will also update prices
      await this.#loadMarkets([], dirtyPools);
    } else if (!skipPriceUpdate && nonDirtyOracles.length) {
      this.#logger?.debug(
        `syncing prices on ${nonDirtyOracles.length} oracles`,
      );
      // no changes in sdk state, but still need to update prices
      await this.updatePrices(nonDirtyOracles);
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
    let txs: IPriceUpdateTx[] = [];
    if (!ignoreUpdateablePrices) {
      // to have correct prices we must first get all updatable price feeds
      const updatables =
        await this.sdk.priceFeeds.getPartialUpdatablePriceFeeds(
          configurators,
          pools,
        );

      // the generate updates
      const updates =
        await this.sdk.priceFeeds.generatePriceFeedsUpdateTxs(updatables);
      txs = updates.txs;
    }
    this.#logger?.debug(
      { configurators, pools },
      `calling getMarkets with ${txs.length} price updates`,
    );
    // ...and push them using multicall before getting answers
    let markets: readonly MarketData[] = [];
    if (txs.length) {
      const [resp] = await simulateWithPriceUpdates(
        this.provider.publicClient,
        {
          priceUpdates: txs,
          contracts: [
            {
              abi: iMarketCompressorAbi,
              address: marketCompressorAddress,
              functionName: "getMarkets",
              args: [this.#marketFilter],
            },
          ],
        },
      );
      markets = resp;
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
    const oraclesStates = await simulateWithPriceUpdates(
      this.provider.publicClient,
      {
        priceUpdates: txs,
        contracts: multicalls.map(mc => mc.call),
      },
    );
    for (let i = 0; i < multicalls.length; i++) {
      const handler = multicalls[i].onResult;
      const result = oraclesStates[i] as any;
      handler(result);
    }
  }

  public override get watchAddresses(): Set<Address> {
    return new Set(this.markets.flatMap(m => Array.from(m.watchAddresses)));
  }

  public get state(): MarketData[] {
    return this.markets.map(market => market.state);
  }

  public stateHuman(raw = true): {
    markets: MarketStateHuman[];
  } {
    return {
      markets: this.markets.map(market => market.stateHuman(raw)),
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
