import type { Address, ContractFunctionReturnType } from "viem";

import type { iPriceFeedCompressorAbi } from "../../abi/compressors.js";
import { iMarketCompressorAbi } from "../../abi/compressors.js";
import type { MarketData, MarketFilter } from "../base/index.js";
import { SDKConstruct } from "../base/index.js";
import {
  ADDRESS_0X0,
  AP_MARKET_COMPRESSOR,
  VERSION_RANGE_310,
} from "../constants/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import type {
  ILogger,
  IPriceUpdateTx,
  MarketStateHuman,
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

  constructor(sdk: GearboxSDK) {
    super(sdk);
    this.#logger = childLogger("MarketRegister", sdk.logger);
  }

  public hydrate(state: MarketData[]): void {
    this.#markets.clear();
    for (const data of state) {
      this.#markets.upsert(
        data.pool.baseParams.addr,
        new MarketSuite(this.sdk, data),
      );
    }
    this.#marketFilter = {
      configurators: this.marketConfigurators.map(c => c.address),
      pools: [],
      underlying: ADDRESS_0X0,
    };
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
    const dirtyPools: PoolSuite[] = [];
    const nonDirtyOracles: Address[] = [];

    for (const m of this.markets) {
      if (m.dirty) {
        dirtyPools.push(m.pool);
      } else {
        nonDirtyOracles.push(m.priceOracle.address);
      }
    }

    if (dirtyPools.length) {
      this.#logger?.debug(`need to reload ${dirtyPools.length} markets`);
      // this will also update prices
      await this.#loadMarkets(
        Array.from(new Set(dirtyPools.map(p => p.marketConfigurator.address))),
        dirtyPools.map(p => p.pool.address),
      );
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
    this.#logger?.debug(
      { configurators, pools },
      `calling getMarkets with ${txs.length} price updates in block ${this.sdk.currentBlock}`,
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
          blockNumber: this.sdk.currentBlock,
          gas: this.sdk.gasLimit,
        },
      );
      markets = resp;
    } else {
      markets = await this.provider.publicClient.readContract({
        abi: iMarketCompressorAbi,
        address: marketCompressorAddress,
        functionName: "getMarkets",
        args: [this.#marketFilter],
        blockNumber: this.sdk.currentBlock,
        // @ts-expect-error
        gas: this.sdk.gasLimit,
      });
    }

    for (const data of markets) {
      this.#markets.upsert(
        data.pool.baseParams.addr,
        new MarketSuite(this.sdk, data),
      );
    }

    this.#logger?.info(
      `loaded ${markets.length} markets in block ${this.sdk.currentBlock}`,
    );
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
        gas: this.sdk.gasLimit,
      },
    );
    for (let i = 0; i < multicalls.length; i++) {
      const handler = multicalls[i].onResult;
      const result = oraclesStates[i] as any as ContractFunctionReturnType<
        typeof iPriceFeedCompressorAbi,
        "view",
        "getPriceOracleState"
      >;
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
}
