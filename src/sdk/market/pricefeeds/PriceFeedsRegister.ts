import type { Address, Hex } from "viem";

import { iMarketCompressorAbi } from "../../abi";
import { type PriceFeedTreeNode, SDKConstruct } from "../../base";
import { ADDRESS_0X0, AP_MARKET_COMPRESSOR } from "../../constants";
import type { GearboxSDK } from "../../GearboxSDK";
import type { ILogger, RawTx } from "../../types";
import { AddressMap, bytes32ToString, childLogger } from "../../utils";
import type { IHooks } from "../../utils/internal";
import { Hooks } from "../../utils/internal";
import type { PartialPriceFeedTreeNode } from "./AbstractPriceFeed";
import { BalancerStablePriceFeedContract } from "./BalancerStablePriceFeed";
import { BalancerWeightedPriceFeedContract } from "./BalancerWeightedPriceFeed";
import { BoundedPriceFeedContract } from "./BoundedPriceFeed";
import { ChainlinkPriceFeedContract } from "./ChainlinkPriceFeed";
import { CompositePriceFeedContract } from "./CompositePriceFeed";
import { CurveCryptoPriceFeedContract } from "./CurveCryptoPriceFeed";
import { CurveStablePriceFeedContract } from "./CurveStablePriceFeed";
import { CurveUSDPriceFeedContract } from "./CurveUSDPriceFeed";
import { Erc4626PriceFeedContract } from "./Erc4626PriceFeed";
import { MellowLRTPriceFeedContract } from "./MellowLRTPriceFeed";
import { RedstonePriceFeedContract } from "./RedstonePriceFeed";
import { RedstoneUpdater } from "./RedstoneUpdater";
import type {
  IPriceFeedContract,
  PriceFeedContractType,
  UpdatePriceFeedsResult,
} from "./types";
import { WstETHPriceFeedContract } from "./WstETHPriceFeed";
import { YearnPriceFeedContract } from "./YearnPriceFeed";
import { ZeroPriceFeedContract } from "./ZeroPriceFeed";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type PriceFeedRegisterHooks = {
  /**
   * Emitted when transactions to update price feeds have been generated, but before they're used anywhere
   */
  updatesGenerated: [UpdatePriceFeedsResult];
};

/**
 * PriceFeedRegister acts as a chain-level cache to avoid creating multiple contract instances.
 * It's reused by PriceFeedFactory belonging to different markets
 *
 **/
export class PriceFeedRegister
  extends SDKConstruct
  implements IHooks<PriceFeedRegisterHooks>
{
  public readonly logger?: ILogger;
  readonly #hooks = new Hooks<PriceFeedRegisterHooks>();
  #feeds = new AddressMap<IPriceFeedContract>();
  #redstoneUpdater: RedstoneUpdater;

  constructor(sdk: GearboxSDK) {
    super(sdk);
    this.logger = childLogger("PriceFeedRegister", sdk.logger);
    this.#redstoneUpdater = new RedstoneUpdater(sdk);
  }

  public addHook = this.#hooks.addHook.bind(this.#hooks);
  public removeHook = this.#hooks.removeHook.bind(this.#hooks);

  /**
   * Returns RawTxs to update price feeds
   * @param priceFeeds top-level price feeds, actual updatable price feeds will be derived. If not provided will use all price feeds that are attached
   * @returns
   */
  public async generatePriceFeedsUpdateTxs(
    priceFeeds?: IPriceFeedContract[],
  ): Promise<UpdatePriceFeedsResult> {
    const updateables = priceFeeds
      ? priceFeeds.flatMap(pf => pf.updatableDependencies())
      : this.#feeds.values();
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
        await this.#redstoneUpdater.getUpdateTxs(redstonePFs);
      for (const { tx, timestamp } of redstoneUpdates) {
        if (timestamp > maxTimestamp) {
          maxTimestamp = timestamp;
        }
        txs.push(tx);
      }
    }

    const result: UpdatePriceFeedsResult = { txs, timestamp: maxTimestamp };
    this.logger?.debug(
      `generated ${txs.length} price feed update transactions, timestamp: ${maxTimestamp}`,
    );
    if (txs.length) {
      await this.#hooks.triggerHooks("updatesGenerated", result);
    }
    return result;
  }

  public mustGet(address: Address): IPriceFeedContract {
    return this.#feeds.mustGet(address);
  }

  public getOrCreate(data: PriceFeedTreeNode): IPriceFeedContract {
    const existing = this.#feeds.get(data.baseParams.addr);
    // it's possible to have non-loaded price feed here first from MarketCompressor.getUpdatablePriceFeeds
    // we ovewrite them using full tree nodes
    if (existing?.loaded) {
      return existing;
    }
    const feed = this.#create(data);
    this.#feeds.upsert(data.baseParams.addr, feed);
    return feed;
  }

  /**
   * Set redstone historical timestamp
   * @param timestampMs in milliseconds, or true to use timestamp from attach block
   */
  public setRedstoneHistoricalTimestamp(timestampMs: number | true): void {
    const ts =
      timestampMs === true ? Number(this.sdk.timestamp) * 1000 : timestampMs;
    this.#redstoneUpdater.setHistoricalTimestamp(ts);
  }

  /**
   * Loads PARTIAL information about all updatable price feeds from MarketCompressor
   * This can later be used to load price feed updates
   */
  public async loadUpdatablePriceFeeds(
    curators?: Address[],
    pools?: Address[],
  ): Promise<void> {
    const marketCompressorAddress = this.sdk.addressProvider.getAddress(
      AP_MARKET_COMPRESSOR,
      3_10,
    );
    const feedsData = await this.provider.publicClient.readContract({
      address: marketCompressorAddress,
      abi: iMarketCompressorAbi,
      functionName: "getUpdatablePriceFeeds",
      args: [
        {
          curators: curators ?? this.sdk.marketRegister.curators,
          pools: pools ?? [],
          underlying: ADDRESS_0X0,
        },
      ],
      // It's passed as ...rest in viem readContract action, but this might change
      // @ts-ignore
      gas: 500_000_000n,
    });
    for (const data of feedsData) {
      const feed = this.#create({ baseParams: data });
      this.#feeds.upsert(feed.address, feed);
    }
    this.logger?.debug(`loaded ${feedsData.length} updatable price feeds`);
  }

  #create(data: PartialPriceFeedTreeNode): IPriceFeedContract {
    const contractType = bytes32ToString(
      data.baseParams.contractType as Hex,
    ) as PriceFeedContractType;

    switch (contractType) {
      case "PF_CHAINLINK_ORACLE":
        return new ChainlinkPriceFeedContract(this.sdk, data);

      case "PF_YEARN_ORACLE":
        return new YearnPriceFeedContract(this.sdk, data);

      case "PF_CURVE_STABLE_LP_ORACLE":
        return new CurveStablePriceFeedContract(this.sdk, data);

      case "PF_WSTETH_ORACLE":
        return new WstETHPriceFeedContract(this.sdk, data);

      case "PF_BOUNDED_ORACLE":
        return new BoundedPriceFeedContract(this.sdk, data);

      case "PF_COMPOSITE_ORACLE":
        return new CompositePriceFeedContract(this.sdk, data);

      case "PF_BALANCER_STABLE_LP_ORACLE":
        return new BalancerStablePriceFeedContract(this.sdk, data);

      case "PF_BALANCER_WEIGHTED_LP_ORACLE":
        return new BalancerWeightedPriceFeedContract(this.sdk, data);

      case "PF_CURVE_CRYPTO_LP_ORACLE":
        return new CurveCryptoPriceFeedContract(this.sdk, data);

      case "PF_REDSTONE_ORACLE":
        return new RedstonePriceFeedContract(this.sdk, data);

      case "PF_ERC4626_ORACLE":
        return new Erc4626PriceFeedContract(this.sdk, data);

      case "PF_CURVE_USD_ORACLE":
        return new CurveUSDPriceFeedContract(this.sdk, data);

      case "PF_ZERO_ORACLE":
        return new ZeroPriceFeedContract(this.sdk, data);

      case "PF_MELLOW_LRT_ORACLE":
        return new MellowLRTPriceFeedContract(this.sdk, data);

      default:
        throw new Error(`Price feed type ${contractType} not supported, `);
    }
  }
}
