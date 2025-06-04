import type { Address, Hex } from "viem";

import { iPriceFeedCompressorAbi } from "../../../abi/compressors.js";
import type { PriceFeedTreeNode } from "../../base/index.js";
import { SDKConstruct } from "../../base/index.js";
import {
  ADDRESS_0X0,
  AP_PRICE_FEED_COMPRESSOR,
  VERSION_RANGE_310,
} from "../../constants/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { ILogger, IPriceUpdateTx } from "../../types/index.js";
import { AddressMap, bytes32ToString, childLogger } from "../../utils/index.js";
import type { IHooks } from "../../utils/internal/index.js";
import { Hooks } from "../../utils/internal/index.js";
import {
  PartialPriceFeedInitError,
  type PartialPriceFeedTreeNode,
} from "./AbstractPriceFeed.js";
import { BalancerStablePriceFeedContract } from "./BalancerStablePriceFeed.js";
import { BalancerWeightedPriceFeedContract } from "./BalancerWeightedPriceFeed.js";
import { BoundedPriceFeedContract } from "./BoundedPriceFeed.js";
import { CompositePriceFeedContract } from "./CompositePriceFeed.js";
import { CurveCryptoPriceFeedContract } from "./CurveCryptoPriceFeed.js";
import { CurveStablePriceFeedContract } from "./CurveStablePriceFeed.js";
import { CurveUSDPriceFeedContract } from "./CurveUSDPriceFeed.js";
import { Erc4626PriceFeedContract } from "./Erc4626PriceFeed.js";
import { ExternalPriceFeedContract } from "./ExternalPriceFeed.js";
import { MellowLRTPriceFeedContract } from "./MellowLRTPriceFeed.js";
import { PendleTWAPPTPriceFeed } from "./PendleTWAPPTPriceFeed.js";
import { PythPriceFeed } from "./PythPriceFeed.js";
import { isRedstone, RedstonePriceFeedContract } from "./RedstonePriceFeed.js";
import type { RedstoneOptions, RedstoneUpdateTask } from "./RedstoneUpdater.js";
import { RedstoneUpdater } from "./RedstoneUpdater.js";
import type {
  IPriceFeedContract,
  PriceFeedContractType,
  UpdatePriceFeedsResult,
} from "./types.js";
import { WstETHPriceFeedContract } from "./WstETHPriceFeed.js";
import { YearnPriceFeedContract } from "./YearnPriceFeed.js";
import { ZeroPriceFeedContract } from "./ZeroPriceFeed.js";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type PriceFeedRegisterHooks = {
  /**
   * Emitted when transactions to update price feeds have been generated, but before they're used anywhere
   */
  updatesGenerated: [UpdatePriceFeedsResult];
};

export interface PriceFeedRegisterOptions {
  redstone?: RedstoneOptions;
}

export interface LatestUpdate {
  timestamp: number;
  redstone: RedstoneUpdateTask[];
}

/**
 * PriceFeedRegister acts as a chain-level cache to avoid creating multiple contract instances.
 * It's reused by PriceOracles belonging to different markets
 *
 **/
export class PriceFeedRegister
  extends SDKConstruct
  implements IHooks<PriceFeedRegisterHooks>
{
  public readonly logger?: ILogger;
  readonly #hooks = new Hooks<PriceFeedRegisterHooks>();
  #feeds = new AddressMap<IPriceFeedContract>(undefined, "priceFeeds");
  #latestUpdate: LatestUpdate | undefined;
  public readonly redstoneUpdater: RedstoneUpdater;

  constructor(sdk: GearboxSDK, opts: PriceFeedRegisterOptions = {}) {
    super(sdk);
    this.logger = childLogger("PriceFeedRegister", sdk.logger);
    this.redstoneUpdater = new RedstoneUpdater(sdk, opts?.redstone);
  }

  public addHook = this.#hooks.addHook.bind(this.#hooks);
  public removeHook = this.#hooks.removeHook.bind(this.#hooks);

  /**
   * Returns RawTxs to update price feeds
   * @param priceFeeds top-level price feeds, actual updatable price feeds will be derived. If not provided will use all price feeds that are attached
   * @param logContext extra information for logging
   * @returns
   */
  public async generatePriceFeedsUpdateTxs(
    priceFeeds?: IPriceFeedContract[],
    logContext: Record<string, any> = {},
  ): Promise<UpdatePriceFeedsResult> {
    const updateables = priceFeeds
      ? priceFeeds.flatMap(pf => pf.updatableDependencies())
      : this.#feeds.values();

    const txs: IPriceUpdateTx[] = [];
    const redstonePFs: RedstonePriceFeedContract[] = [];
    const latestUpdate: LatestUpdate = {
      redstone: [],
      timestamp: Math.floor(Date.now() / 1000),
    };

    for (const pf of updateables) {
      if (isRedstone(pf)) {
        redstonePFs.push(pf);
      }
    }

    let maxTimestamp = 0;
    if (redstonePFs.length > 0) {
      const redstoneUpdates = await this.redstoneUpdater.getUpdateTxs(
        redstonePFs,
        logContext,
      );
      for (const tx of redstoneUpdates) {
        const { data } = tx;
        const { timestamp } = data;
        if (timestamp > maxTimestamp) {
          maxTimestamp = timestamp;
        }
        txs.push(tx);
        latestUpdate.redstone.push(data);
      }
    }

    const result: UpdatePriceFeedsResult = { txs, timestamp: maxTimestamp };
    const tsDelta = BigInt(maxTimestamp) - this.sdk.timestamp;
    this.logger?.debug(
      logContext,
      `generated ${txs.length} price feed update transactions, timestamp: ${maxTimestamp} (delta ${tsDelta})`,
    );
    if (txs.length) {
      await this.#hooks.triggerHooks("updatesGenerated", result);
    }
    this.#latestUpdate = latestUpdate;
    return result;
  }

  public has(address: Address): boolean {
    return this.#feeds.has(address);
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
    const feed = this.create(data);
    if (!feed.loaded) {
      throw new PartialPriceFeedInitError({ ...data, abi: [], name: "" });
    }
    this.#feeds.upsert(data.baseParams.addr, feed);
    return feed;
  }

  /**
   * Loads PARTIAL information about all updatable price feeds from MarketCompressor
   * This is not saved anywhere in PriceFeedRegister, and can later be used to load price feed updates
   */
  public async getPartialUpdatablePriceFeeds(
    configurators: Address[],
    pools?: Address[],
  ): Promise<IPriceFeedContract[]> {
    const [priceFeedCompressorAddress] = this.sdk.addressProvider.mustGetLatest(
      AP_PRICE_FEED_COMPRESSOR,
      VERSION_RANGE_310,
    );
    this.logger?.debug(
      { configurators, pools },
      `calling getUpdatablePriceFeeds in block ${this.sdk.currentBlock}`,
    );
    const result = await this.provider.publicClient.readContract({
      address: priceFeedCompressorAddress,
      abi: iPriceFeedCompressorAbi,
      functionName: "getUpdatablePriceFeeds",
      args: [
        {
          configurators,
          pools: pools ?? [],
          underlying: ADDRESS_0X0,
        },
      ],
      blockNumber: this.sdk.currentBlock,
      // @ts-expect-error
      gas: this.sdk.gasLimit,
    });
    this.logger?.debug(
      `loaded ${result.length} partial updatable price feeds in block ${this.sdk.currentBlock}`,
    );
    return result.map(baseParams => this.#createUpdatableProxy({ baseParams }));
  }

  public create(data: PartialPriceFeedTreeNode): IPriceFeedContract {
    const contractType = bytes32ToString(
      data.baseParams.contractType as Hex,
    ) as PriceFeedContractType;

    switch (contractType) {
      case "PRICE_FEED::BALANCER_STABLE":
        return new BalancerStablePriceFeedContract(this.sdk, data);

      case "PRICE_FEED::BALANCER_WEIGHTED":
        return new BalancerWeightedPriceFeedContract(this.sdk, data);

      case "PRICE_FEED::BOUNDED":
        return new BoundedPriceFeedContract(this.sdk, data);

      case "PRICE_FEED::COMPOSITE":
        return new CompositePriceFeedContract(this.sdk, data);

      case "PRICE_FEED::CURVE_CRYPTO":
        return new CurveCryptoPriceFeedContract(this.sdk, data);

      case "PRICE_FEED::CURVE_STABLE":
        return new CurveStablePriceFeedContract(this.sdk, data);

      case "PRICE_FEED::CURVE_USD":
        return new CurveUSDPriceFeedContract(this.sdk, data);

      case "PRICE_FEED::ERC4626":
        return new Erc4626PriceFeedContract(this.sdk, data);

      case "PRICE_FEED::EXTERNAL":
        return new ExternalPriceFeedContract(this.sdk, data);

      case "PRICE_FEED::MELLOW_LRT":
        return new MellowLRTPriceFeedContract(this.sdk, data);

      case "PRICE_FEED::PENDLE_PT_TWAP":
        return new PendleTWAPPTPriceFeed(this.sdk, data);

      case "PRICE_FEED::PYTH":
        return new PythPriceFeed(this.sdk, data);

      case "PRICE_FEED::REDSTONE":
        return new RedstonePriceFeedContract(this.sdk, data);

      case "PRICE_FEED::WSTETH":
        return new WstETHPriceFeedContract(this.sdk, data);

      case "PRICE_FEED::YEARN":
        return new YearnPriceFeedContract(this.sdk, data);

      case "PRICE_FEED::ZERO":
        return new ZeroPriceFeedContract(this.sdk, data);

      default: {
        const err = new Error(
          `Price feed type ${contractType} not supported for price feed at ${data.baseParams.addr}`,
        );
        if (this.sdk.strictContractTypes) {
          throw err;
        }
        this.logger?.error(err);
        return new ExternalPriceFeedContract(this.sdk, data);
      }
    }
  }

  #createUpdatableProxy(data: PartialPriceFeedTreeNode): IPriceFeedContract {
    return new Proxy(this.create(data), {
      get(target, prop) {
        // when using this proxy, we will already have all the updatable dependencies, as returned from contracts
        // so this protects price feed instances from throwing errors due to being partially initialized
        if (prop === "updatableDependencies") {
          return () => [target];
        }
        return target[prop as keyof IPriceFeedContract];
      },
    });
  }

  /**
   * Information update latest update of updatable price feeds, for diagnostic purposes
   */
  public get latestUpdate(): LatestUpdate | undefined {
    return this.#latestUpdate;
  }
}
