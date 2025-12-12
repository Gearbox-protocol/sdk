import type { Address, ContractFunctionReturnType } from "viem";
import { marketCompressorAbi } from "../../abi/compressors/marketCompressor.js";
import type { priceFeedCompressorAbi } from "../../abi/compressors/priceFeedCompressor.js";
import type { MarketData, MarketFilter } from "../base/index.js";
import { SDKConstruct } from "../base/index.js";
import {
  ADDRESS_0X0,
  AP_MARKET_COMPRESSOR,
  VERSION_RANGE_310,
} from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type { IPriceUpdateTx, MarketStateHuman } from "../types/index.js";
import { AddressMap } from "../utils/index.js";
import { simulateWithPriceUpdates } from "../utils/viem/index.js";
import type { CreditSuite } from "./credit/index.js";
import { MarketConfiguratorContract } from "./MarketConfiguratorContract.js";
import { MarketSuite } from "./MarketSuite.js";
import type { IPriceOracleContract } from "./oracle/index.js";
import type { PoolSuite } from "./pool/index.js";

export class MarketRegister extends SDKConstruct {
  /**
   * Mapping pool.address -> MarketSuite
   */
  #markets = new AddressMap<MarketSuite>(undefined, "markets");
  #marketFilter?: MarketFilter;
  #marketConfigurators = new AddressMap<MarketConfiguratorContract>(
    undefined,
    "marketConfigurators",
  );
  #ignoreMarkets: Set<Address>;

  constructor(sdk: GearboxSDK, ignoreMarkets: Address[] = []) {
    super(sdk);
    this.#ignoreMarkets = new Set(
      ignoreMarkets.map(m => m.toLowerCase() as Address),
    );
  }

  public hydrate(state: MarketData[]): void {
    this.#markets.clear();
    const configurators = new Set<Address>(state.map(m => m.configurator));
    this.#setMarketFilter([...configurators]);
    for (const data of state) {
      const pool = data.pool.baseParams.addr;
      if (this.#ignoreMarkets.has(pool.toLowerCase() as Address)) {
        this.logger?.debug(
          `ignoring market of pool ${pool} (${data.pool.name})`,
        );
        continue;
      }
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
      this.logger?.warn(
        "no market configurators provided, skipping loadMarkets",
      );
      return;
    }
    await this.#loadMarkets(marketConfigurators, [], ignoreUpdateablePrices);
  }

  #setMarketFilter(
    configurators: readonly Address[],
    pools: readonly Address[] = [],
  ): void {
    for (const c of configurators) {
      // we're creating contract instances here, so they will already exist when loadMarkets is called
      // this way we can later call syncState and detect that new markets were created, even in case when there we no markets before
      // i.e. to handle the edge case of creation of first market with sdk already attached
      this.#marketConfigurators.upsert(
        c,
        new MarketConfiguratorContract(this.sdk, c),
      );
    }
    this.#marketFilter = {
      configurators,
      pools,
      underlying: ADDRESS_0X0,
    };
  }

  public get marketFilter(): MarketFilter {
    if (!this.#marketFilter) {
      throw new Error(
        "market filter is not set, check if market register was properly attached or hydrated",
      );
    }
    return this.#marketFilter;
  }

  public async syncState(ignoreUpdateablePrices?: boolean): Promise<void> {
    // marketCompressor does not have granularity
    // if we have one market configurator with some dirty markets and another market configurator with new markets
    // we cannot just reload dirty markets in first and load new ones in second
    //
    // so the policy is - if anything is dirty, reload everything. otherwise reload only prices
    const dirty =
      this.markets.some(m => m.dirty) ||
      this.marketConfigurators.some(c => c.dirty);

    if (dirty) {
      this.logger?.debug(
        "some markets or market configurators are dirty, reloading everything",
      );
      // this will also update prices
      await this.#loadMarkets(
        [...this.marketFilter.configurators],
        [...this.marketFilter.pools],
        ignoreUpdateablePrices,
      );
    } else if (!ignoreUpdateablePrices) {
      // no changes in sdk state, but still need to update prices
      await this.updatePrices();
    }
  }

  async #loadMarkets(
    configurators: Address[],
    pools: Address[],
    ignoreUpdateablePrices?: boolean,
  ): Promise<void> {
    this.#setMarketFilter(configurators, pools);
    const [marketCompressorAddress] = this.sdk.addressProvider.mustGetLatest(
      AP_MARKET_COMPRESSOR,
      VERSION_RANGE_310,
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
    this.logger?.debug(
      { configurators, pools },
      `calling getMarkets with ${txs.length} price updates in block ${this.sdk.currentBlock}`,
    );
    // ...and push them using multicall before getting answers
    let markets: readonly MarketData[] = [];
    if (txs.length) {
      const [resp] = await simulateWithPriceUpdates(this.client, {
        priceUpdates: txs,
        contracts: [
          {
            abi: marketCompressorAbi,
            address: marketCompressorAddress,
            functionName: "getMarkets",
            args: [this.marketFilter],
          },
        ],
        blockNumber: this.sdk.currentBlock,
        gas: this.sdk.gasLimit,
      });
      markets = resp;
    } else {
      markets = await this.client.readContract({
        abi: marketCompressorAbi,
        address: marketCompressorAddress,
        functionName: "getMarkets",
        args: [this.marketFilter],
        blockNumber: this.sdk.currentBlock,
        // @ts-expect-error
        gas: this.sdk.gasLimit,
      });
    }

    for (const data of markets) {
      const pool = data.pool.baseParams.addr;
      if (this.#ignoreMarkets.has(pool.toLowerCase() as Address)) {
        this.logger?.debug(
          `ignoring market of pool ${pool} (${data.pool.name})`,
        );
        continue;
      }
      this.#markets.upsert(pool, new MarketSuite(this.sdk, data));
    }

    this.logger?.info(
      `loaded ${this.#markets.size} markets in block ${this.sdk.currentBlock}`,
    );
  }

  /**
   * Loads new prices and price feeds for given oracles from PriceFeedCompressor, defaults to all oracles
   * Supports v300 and v310 oracles
   */
  public async updatePrices(oracles?: Address[]): Promise<void> {
    const uniqOracles = new AddressMap<IPriceOracleContract>();
    for (const m of this.markets) {
      if (!oracles || oracles.includes(m.priceOracle.address)) {
        uniqOracles.upsert(m.priceOracle.address, m.priceOracle);
      }
    }

    const multicalls = uniqOracles.values().map(o => o.syncStateMulticall());
    if (!multicalls.length) {
      return;
    }
    this.logger?.debug(`syncing prices on ${multicalls.length} oracles`);
    const { txs } = await this.sdk.priceFeeds.generatePriceFeedsUpdateTxs();
    const oraclesStates = await simulateWithPriceUpdates(this.client, {
      priceUpdates: txs,
      contracts: multicalls.map(mc => mc.call),
      gas: this.sdk.gasLimit,
      blockNumber: this.sdk.currentBlock,
    });
    for (let i = 0; i < multicalls.length; i++) {
      const handler = multicalls[i].onResult;
      const result = oraclesStates[i] as any as ContractFunctionReturnType<
        typeof priceFeedCompressorAbi,
        "view",
        "getPriceOracleState"
      >;
      handler(result);
    }
  }

  public override get watchAddresses(): Set<Address> {
    return new Set([
      ...this.markets.flatMap(m => Array.from(m.watchAddresses)),
      // this is needed to handle edge case of market configurator without markets, to detect CreateMarket event
      ...this.marketFilter.configurators,
    ]);
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

  public get priceOracles(): IPriceOracleContract[] {
    return this.markets.map(market => market.priceOracle);
  }

  public get creditManagers(): CreditSuite[] {
    return this.markets.flatMap(market => market.creditManagers);
  }

  public get marketConfigurators(): MarketConfiguratorContract[] {
    return this.#marketConfigurators.values();
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
}
