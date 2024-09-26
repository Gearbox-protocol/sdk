import { getTokenSymbolOrTicker } from "@gearbox-protocol/sdk-gov";
import type { type Address, Hex } from "viem";
import { decodeFunctionData, encodeFunctionData } from "viem";

import { iCreditFacadeV3MulticallAbi, iUpdatablePriceFeedAbi } from "../abi";
import {
  BaseContract,
  type MarketDataStruct,
  type PriceFeedMapEntry,
  type PriceFeedTreeNode,
} from "../base";
import { AP_ZERO_PRICE_FEED } from "../constants";
import type { GearboxSDK } from "../GearboxSDK";
import type {
  IPriceFeedContract,
  PriceFeedCompressorData,
  PriceFeedContractType,
  PriceFeedUsageType,
} from "../pricefeeds";
import {
  BalancerStablePriceFeedContract,
  BalancerWeightedPriceFeedContract,
  BoundedPriceFeedContract,
  ChainlinkPriceFeedContract,
  CompositePriceFeedContract,
  CurveCryptoPriceFeedContract,
  CurveStablePriceFeedContract,
  CurveUSDPriceFeedContract,
  Erc4626PriceFeedContract,
  MellowLRTPriceFeedContract,
  RedstonePriceFeedContract,
  WstETHPriceFeedContract,
  YearnPriceFeedContract,
  ZeroPriceFeedContract,
} from "../pricefeeds";
import type { PriceOracleState } from "../state";
import type { ILogger, MultiCall, RawTx } from "../types";
import { bytes32ToString, childLogger } from "../utils";

interface PriceFeedsForTokensOptions {
  main?: boolean;
  reserve?: boolean;
}

export interface UpdatePriceFeedsResult {
  txs: RawTx[];
  timestamp: number;
}

/**
 * feed's address + staleness period
 */
type PriceFeedCacheKey = `${Address}:${number}`;

export class PriceFeedFactory {
  readonly #sdk: GearboxSDK;

  public readonly logger?: ILogger;

  /**
   * simple cache to avoid creating multiple contract instances
   * ugly workaround for the face that "stalenessPeriod" is not "PriceFeed"'s attribute
   * for example, chainlink price feed can have one staleness period as a top-level oracle entry,
   * and another staleness period when it's a part of a composite price feed
   *
   * This is static because price feeds can be shared by different markets
   **/
  static #contractsCache: Record<PriceFeedCacheKey, IPriceFeedContract> = {};

  public priceOracleV3Contract: PriceOracleV3Contract;
  /**
   * Mapping Token => PriceFeed
   */
  public mainPriceFeeds: Record<Address, IPriceFeedContract> = {};
  /**
   * Mapping Token => PriceFeed
   */
  public reservePriceFeeds: Record<Address, IPriceFeedContract> = {};

  protected priceFeedTree: Record<Address, PriceFeedTreeNode> = {};

  public zeroPriceFeed: ZeroPriceFeedContract;

  public mainPrices: Record<Address, bigint> = {};
  public reservePrices: Record<Address, bigint> = {};

  static attachMarket(
    market: MarketDataStruct,
    sdk: GearboxSDK,
  ): PriceFeedFactory {
    const factory = new PriceFeedFactory(sdk);
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
    factory.logger?.debug(
      `Attaching PriceOracleV3 at ${priceOracleAddr}, priceFeedMapping size: ${priceFeedMapping.length}, priceFeedStructure size: ${priceFeedStructure.length} `,
    );

    const zeroPriceFeed =
      factory.#sdk.addressProvider.getAddress(AP_ZERO_PRICE_FEED);

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

    factory.logger?.debug(
      `Got ${Object.keys(factory.mainPriceFeeds).length} main and ${Object.keys(factory.reservePriceFeeds).length} reserve price feeds`,
    );

    return factory;
  }

  constructor(sdk: GearboxSDK) {
    this.#sdk = sdk;
    this.logger = childLogger("PriceFeedFactory", sdk.logger);
  }

  /**
   * Returns main and reserve price feeds for given tokens
   * @param tokens
   * @param opts Option to include main/reserve feeds only, defaults to both
   * @returns
   */
  public priceFeedsForTokens(
    tokens: Address[],
    opts?: PriceFeedsForTokensOptions,
  ): IPriceFeedContract[] {
    const main = opts?.main ?? true;
    const reserve = opts?.reserve ?? true;
    return tokens
      .flatMap(t => [
        main ? this.mainPriceFeeds[t] : undefined,
        reserve ? this.reservePriceFeeds[t] : undefined,
      ])
      .filter((f): f is IPriceFeedContract => !!f);
  }

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

    return PriceFeedFactory.generatePriceFeedsUpdateTxs(updatables);
  }

  /**
   * Returns RawTxs to update price feeds
   * This method is static because price feeds may belong to different markets with different PriceFeedFactory instances
   * @param priceFeeds top-level price feeds, actual updatable price feeds will be derived. If not provided will use all price feeds that are attached
   * @returns
   */
  public static async generatePriceFeedsUpdateTxs(
    priceFeeds?: IPriceFeedContract[],
  ): Promise<UpdatePriceFeedsResult> {
    const priceFeedz =
      priceFeeds ?? Object.values(PriceFeedFactory.#contractsCache);
    const updateables = priceFeedz.flatMap(pf => pf.updatableDependencies());
    const txs: RawTx[] = [];
    const redstonePFs: RedstonePriceFeedContract[] = [];

    for (const pf of updateables) {
      if (pf instanceof RedstonePriceFeedContract) {
        redstonePFs.push(pf);
      }
    }

    let maxTimestamp = 0;
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

    let queryBlock = this.#sdk.currentBlock;
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
    if (!PriceFeedFactory.#contractsCache[key]) {
      PriceFeedFactory.#contractsCache[key] = this.#createPriceFeed(
        feed,
        stalenessPeriod,
      );
    }
    return PriceFeedFactory.#contractsCache[key];
  }

  /**
   * Converts previously obtained price updates into CreditFacade multicall entries
   * @param creditFacade
   * @param priceUpdates
   * @returns
   */
  public onDemandPriceUpdates(
    creditFacade: Address,
    priceUpdates?: UpdatePriceFeedsResult,
  ): MultiCall[] {
    // TODO: really here I'm doing lots of reverse processing:
    // decooding RawTx into Redstone calldata
    // and then finding token + reserve value for a price feed
    // it would be much nicer to have intermediate format and get RawTx/OnDemandPriceUpdate/ViemMulticall from it (as it's done in liquidator)
    const result: MultiCall[] = [];
    if (!priceUpdates) {
      return result;
    }
    const { txs } = priceUpdates;

    for (const tx of txs) {
      const { to: priceFeed, callData } = tx;
      const [token, reserve] = this.#findTokenForPriceFeed(priceFeed);
      const { args } = decodeFunctionData({
        abi: iUpdatablePriceFeedAbi,
        data: callData,
      });
      const data = args[0]!;
      result.push({
        target: creditFacade,
        callData: encodeFunctionData({
          abi: iCreditFacadeV3MulticallAbi,
          functionName: "onDemandPriceUpdate",
          args: [token, reserve, data],
        }),
      });
    }
    return result;
  }

  /**
   * Helper method to find "attachment point" of price feed (makes sense for updatable price feeds only) - token (in v3.0 can be ticker) and main/reserve flag
   *
   * @param priceFeed
   * @returns
   */
  #findTokenForPriceFeed(
    priceFeed: Address,
  ): [token: Address, reserve: boolean] {
    for (const [token, pf] of Object.entries(this.mainPriceFeeds)) {
      if (pf.address === priceFeed) {
        return [token as Address, false];
      }
    }
    for (const [token, pf] of Object.entries(this.reservePriceFeeds)) {
      if (pf.address === priceFeed) {
        return [token as Address, true];
      }
    }
    throw new Error(`cannot find token for price feed ${priceFeed}`);
  }

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
    this.#sdk.provider.addressLabels.set(address, label => {
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
