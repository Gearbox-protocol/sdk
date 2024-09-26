import type { Address } from "@gearbox-protocol/sdk-gov";
import { getTokenSymbolOrTicker } from "@gearbox-protocol/sdk-gov";
import type { Hex } from "viem";

import { PriceOracleV3Contract } from "../../contracts/priceOracle/PriceOracleV3Contract";
import { AP_ZERO_PRICE_FEED } from "../../core/addresses";
import { Factory } from "../../core/factory";
import type { RawTx } from "../../core/transactions";
import { bytes32ToString } from "../../utils/enumerate";
import { BaseContract } from "../base/BaseContract";
import type {
  MarketDataStruct,
  PriceFeedMapEntry,
  PriceFeedTreeNode,
} from "../base/types";
import { BalancerStablePriceFeedContract } from "../pricefeeds/BalancerStablePriceFeed";
import { BalancerWeightedPriceFeedContract } from "../pricefeeds/BalancerWeightedPriceFeed";
import { BoundedPriceFeedContract } from "../pricefeeds/BoundedPriceFeed";
import { ChainlinkPriceFeedContract } from "../pricefeeds/ChainlinkPriceFeed";
import { CompositePriceFeedContract } from "../pricefeeds/CompositePriceFeed";
import { CurveCryptoPriceFeedContract } from "../pricefeeds/CurveCryptoPriceFeed";
import { CurveStablePriceFeedContract } from "../pricefeeds/CurveStablePriceFeed";
import { CurveUSDPriceFeedContract } from "../pricefeeds/CurveUSDPriceFeed";
import { Erc4626PriceFeedContract } from "../pricefeeds/Erc4626PriceFeed";
import { MellowLRTPriceFeedContract } from "../pricefeeds/MellowLRTPriceFeed";
import { RedstonePriceFeedContract } from "../pricefeeds/RedstonePriceFeed";
import type {
  IPriceFeedContract,
  PriceFeedCompressorData,
  PriceFeedContractType,
  PriceFeedUsageType,
} from "../pricefeeds/types";
import { WstETHPriceFeedContract } from "../pricefeeds/WstETHPriceFeed";
import { YearnPriceFeedContract } from "../pricefeeds/YearnPriceFeed";
import { ZeroPriceFeedContract } from "../pricefeeds/ZeroPriceFeed";
import type { GearboxSDK } from "../SDKService";
import type { PriceOracleState } from "../state/priceFactoryState";

export interface UpdatePriceFeedsResult {
  txs: RawTx[];
  timestamp: number;
}

/**
 * feed's address + staleness period
 */
type PriceFeedCacheKey = `${Address}:${number}`;

export class PriceFeedFactory extends Factory {
  public priceOracleV3Contract: PriceOracleV3Contract;
  public mainPriceFeeds: Record<Address, IPriceFeedContract> = {};
  public reservePriceFeeds: Record<Address, IPriceFeedContract> = {};

  protected priceFeedTree: Record<Address, PriceFeedTreeNode> = {};
  /**
   * simple cache to avoid creating multiple contract instances
   * ugly workaround for the face that "stalenessPeriod" is not "PriceFeed"'s attribute
   * for example, chainlink price feed can have one staleness period as a top-level oracle entry,
   * and another staleness period when it's a part of a composite price feed
   **/
  #contractsCache: Record<PriceFeedCacheKey, IPriceFeedContract> = {};

  public zeroPriceFeed: ZeroPriceFeedContract;

  public mainPrices: Record<Address, bigint> = {};
  public reservePrices: Record<Address, bigint> = {};

  static attachMarket(
    market: MarketDataStruct,
    MgmtService: GearboxSDK,
  ): PriceFeedFactory {
    const factory = new PriceFeedFactory(MgmtService);
    return PriceFeedFactory.attachMarketInt(market, factory);
  }

  protected static attachMarketInt<T extends PriceFeedFactory>(
    market: MarketDataStruct,
    factory: T,
  ): T {
    const { priceOracleData } = market;
    const { priceFeedMapping, priceFeedStructure } = priceOracleData;

    return PriceFeedFactory.#attach(
      factory,
      priceOracleData.baseParams.addr as Address,
      [...priceFeedMapping],
      [...priceFeedStructure],
    );
  }

  static #attach<T extends PriceFeedFactory>(
    factory: T,
    priceOracleAddr: Address,
    priceFeedMapping: PriceFeedMapEntry[],
    priceFeedStructure: PriceFeedTreeNode[],
  ): T {
    const v3 = factory.sdk.v3;
    v3.logger.debug(
      `Attaching PriceOracleV3 at ${priceOracleAddr}, priceFeedMapping size: ${priceFeedMapping.length}, priceFeedStructure size: ${priceFeedStructure.length} `,
    );

    const zeroPriceFeed =
      factory.sdk.addressProvider.getAddress(AP_ZERO_PRICE_FEED);

    factory.priceOracleV3Contract = PriceOracleV3Contract.attach(
      factory,
      priceOracleAddr,
      priceFeedMapping,
    );

    factory.zeroPriceFeed = ZeroPriceFeedContract.attach({
      factory,
      address: zeroPriceFeed,
    });

    priceFeedStructure.forEach(d => {
      factory.priceFeedTree[d.baseParams.addr.toLowerCase() as Address] = d;
    });

    priceFeedMapping.forEach(d => {
      const t = d.token as Address;

      const pf = factory.attachPriceFeed(
        d.priceFeed as Address,
        Number(d.stalenessPeriod),
      );

      const price = factory.getPriceFeedData(d.priceFeed as Address).price;
      if (d.reserve) {
        factory.reservePriceFeeds[t] = pf;
        factory.reservePrices[t] = price;
      } else {
        factory.mainPriceFeeds[t] = pf;
        factory.mainPrices[t] = price;
      }

      factory.labelPriceFeed(
        d.priceFeed as Address,
        d.reserve ? "Reserve" : "Main",
        t,
      );
    });

    v3.logger.debug(
      `Got ${Object.keys(factory.mainPriceFeeds).length} main and ${Object.keys(factory.reservePriceFeeds).length} reserve price feeds`,
    );

    return factory;
  }

  // public async generateUpdatesForNewUpdatableFeeds(
  //   addresses: Array<Address>,
  // ): Promise<UpdatePriceFeedsResult> {
  //   const priceFeedTree =
  //     await this.sdk.peripheryFactory.priceFeedCompressor!.loadPriceFeedTree(
  //       addresses,
  //     );

  //   const updatables: IPriceFeedContract[] = [];
  //   for (const node of priceFeedTree) {
  //     this.priceFeedTree[node.baseParams.addr.toLowerCase() as Address] = node;
  //     if (node.updatable) {
  //       updatables.push(
  //         BaseContract.contractByAddress(
  //           node.baseParams.addr as Address,
  //         ) as unknown as IPriceFeedContract,
  //       );
  //     }
  //   }

  //   return await this.generatePriceFeedsUpdateTxs(updatables);
  // }

  public async updateRedstonePriceFeeds(): Promise<UpdatePriceFeedsResult> {
    const updatables: IPriceFeedContract[] = [];
    for (const node of Object.values(this.priceFeedTree)) {
      if (node.updatable) {
        updatables.push(
          BaseContract.contractByAddress(
            node.baseParams.addr as Address,
          ) as unknown as IPriceFeedContract,
        );
      }
    }

    return await this.generatePriceFeedsUpdateTxs(updatables);
  }

  public async generatePriceFeedsUpdateTxs(
    priceFeeds: IPriceFeedContract[],
  ): Promise<UpdatePriceFeedsResult> {
    const txs: Array<RawTx> = [];
    let maxTimestamp = 0;
    const redstonePFs: RedstonePriceFeedContract[] = [];

    for (const pf of priceFeeds) {
      if (pf instanceof RedstonePriceFeedContract) {
        redstonePFs.push(pf);
      }
    }

    if (redstonePFs.length > 0) {
      const redstoneUpdates =
        await RedstonePriceFeedContract.getUpdateTxs(redstonePFs);
      for (const { tx, timestamp } of redstoneUpdates) {
        if (timestamp > maxTimestamp) {
          maxTimestamp = timestamp;
        }
        txs.push(tx);
      }
    }

    return { txs, timestamp: maxTimestamp };
  }

  public async updatePrices(): Promise<void> {
    const { txs: priceUpdatesTxs, timestamp } =
      await this.updateRedstonePriceFeeds();

    let queryBlock = this.sdk.currentBlock;
    if (this.v3.testnet && priceUpdatesTxs.length > 0) {
      // timestamp will be updated in the next block, so it's crucial to increment quering block
      await this.v3.warpSafe(timestamp);
      queryBlock = await this.v3.publicClient.getBlockNumber();
    }

    const { mainPrices, reservePrices } =
      await this.priceOracleV3Contract!.loadPrices(priceUpdatesTxs, queryBlock);

    this.mainPrices = mainPrices;
    this.reservePrices = reservePrices;
  }

  public attachPriceFeed(
    feed: Address,
    stalenessPeriod: number,
  ): IPriceFeedContract {
    const key: PriceFeedCacheKey = `${feed.toLowerCase() as Address}:${stalenessPeriod}`;
    if (!this.#contractsCache[key]) {
      this.#contractsCache[key] = this.#createPriceFeed(feed, stalenessPeriod);
    }
    return this.#contractsCache[key];
  }

  //   | "PF_BALANCER_STABLE_LP_ORACLE"
  // | "PF_CURVE_STABLE_LP_ORACLE"
  // | "PF_CURVE_CRYPTO_LP_ORACLE"
  // | "PF_CURVE_USD_ORACLE"
  // | "PF_ERC4626_ORACLE"
  // | "PF_WSTETH_ORACLE"
  // | "PF_YEARN_ORACLE"
  // | "PF_MELLOW_LRT_ORACLE"
  // | "PF_BALANCER_WEIGHTED_LP_ORACLE"
  // | "PF_BOUNDED_ORACLE"
  // | "PF_PYTH_ORACLE"
  // | "PF_REDSTONE_ORACLE";

  #createPriceFeed(feed: Address, stalenessPeriod: number): IPriceFeedContract {
    const { contractType, version, updatable } = this.getPriceFeedData(feed);
    const args = { factory: this, address: feed, version, updatable };

    switch (contractType) {
      case "PF_CHAINLINK_ORACLE":
        return ChainlinkPriceFeedContract.attach(args, stalenessPeriod);

      case "PF_YEARN_ORACLE":
        return YearnPriceFeedContract.attach(args);

      case "PF_CURVE_STABLE_LP_ORACLE":
        return CurveStablePriceFeedContract.attach(args);

      case "PF_WSTETH_ORACLE":
        return WstETHPriceFeedContract.attach(args);

      case "PF_BOUNDED_ORACLE":
        return BoundedPriceFeedContract.attach(args, stalenessPeriod);

      case "PF_COMPOSITE_ORACLE":
        return CompositePriceFeedContract.attach(args);

      case "PF_BALANCER_STABLE_LP_ORACLE":
        return BalancerStablePriceFeedContract.attach(args);

      case "PF_BALANCER_WEIGHTED_LP_ORACLE":
        return BalancerWeightedPriceFeedContract.attach(args);

      case "PF_CURVE_CRYPTO_LP_ORACLE":
        return CurveCryptoPriceFeedContract.attach(args);

      case "PF_REDSTONE_ORACLE":
        return RedstonePriceFeedContract.attach(args);

      case "PF_ERC4626_ORACLE":
        return Erc4626PriceFeedContract.attach(args);

      case "PF_CURVE_USD_ORACLE":
        return CurveUSDPriceFeedContract.attach(args);

      case "PF_ZERO_ORACLE":
        return ZeroPriceFeedContract.attach(args);

      case "PF_MELLOW_LRT_ORACLE":
        return MellowLRTPriceFeedContract.attach(args);

      default:
        throw new Error(`Price feed type ${contractType} not supported, `);
    }
  }

  public get state(): PriceOracleState {
    return {
      priceOracleV3: this.priceOracleV3Contract.state,
      mainPriceFeeds: Object.fromEntries(
        Object.entries(this.mainPriceFeeds).map(([token, v]) => [
          token,
          v.state,
        ]),
      ),
      reservePriceFeeds: Object.fromEntries(
        Object.entries(this.reservePriceFeeds).map(([token, v]) => [
          token,
          v.state,
        ]),
      ),
    };
  }

  protected labelPriceFeed(
    address: Address,
    usage: PriceFeedUsageType,
    token: Address,
  ): void {
    this.addressLabels.set(address, label => {
      let pricefeedTag = `${getTokenSymbolOrTicker(token)}.${usage}`;

      if (label) {
        pricefeedTag = `${label}, ${pricefeedTag}`;
      }
      return pricefeedTag;
    });
  }

  public getPriceFeedData(address: Address): PriceFeedCompressorData {
    const result = this.priceFeedTree[address.toLowerCase() as Address];
    if (!result) throw `Pricefeed data for ${address} no found`;

    return {
      address,
      version: Number(result.baseParams.version),
      contractType: bytes32ToString(
        result.baseParams.contractType as Hex,
      ) as PriceFeedContractType,
      // TODO: need to define conversion contractType -> priceFeedType, or get rid of priceFeedType

      skipCheck: result.skipCheck,
      updatable: result.updatable,
      underlyingFeeds: result.underlyingFeeds as Array<Address>,
      underlyingStalenessPeriods: [...result.underlyingStalenessPeriods],
      price: result.answer.price,
      decimals: result.decimals,
      serializedParams: result.baseParams.serializedParams as Hex,
    };
  }
}
