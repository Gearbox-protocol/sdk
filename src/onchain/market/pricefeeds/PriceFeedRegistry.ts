import type { Address, Hex } from "viem";
import type { PriceFeedTreeNode } from "../../base/index.js";
import { SDKConstruct } from "../../base/index.js";
import { AddressMap, bytes32ToString } from "../../utils/index.js";
import {
  PartialPriceFeedInitError,
  type PartialPriceFeedTreeNode,
} from "./AbstractPriceFeed.js";
import { BalancerStablePriceFeedContract } from "./feeds/BalancerStablePriceFeed.js";
import { BalancerWeightedPriceFeedContract } from "./feeds/BalancerWeightedPriceFeed.js";
import { BoundedPriceFeedContract } from "./feeds/BoundedPriceFeed.js";
import { CompositePriceFeedContract } from "./feeds/CompositePriceFeed.js";
import { ConstantPriceFeedContract } from "./feeds/ConstantPriceFeed.js";
import { CurveCryptoPriceFeedContract } from "./feeds/CurveCryptoPriceFeed.js";
import { CurveStablePriceFeedContract } from "./feeds/CurveStablePriceFeed.js";
import { CurveUSDPriceFeedContract } from "./feeds/CurveUSDPriceFeed.js";
import { Erc4626PriceFeedContract } from "./feeds/Erc4626PriceFeed.js";
import { ExternalPriceFeedContract } from "./feeds/ExternalPriceFeed.js";
import { MellowLRTPriceFeedContract } from "./feeds/MellowLRTPriceFeed.js";
import { PendleTWAPPTPriceFeed } from "./feeds/PendleTWAPPTPriceFeed.js";
import { PythPriceFeed } from "./feeds/PythPriceFeed.js";
import { RedstonePriceFeedContract } from "./feeds/RedstonePriceFeed.js";
import { WstETHPriceFeedContract } from "./feeds/WstETHPriceFeed.js";
import { YearnPriceFeedContract } from "./feeds/YearnPriceFeed.js";
import { ZeroPriceFeedContract } from "./feeds/ZeroPriceFeed.js";
import type { IPriceFeedContract, PriceFeedContractType } from "./types.js";

/**
 * Chain-level cache of price feed contract instances.
 *
 * All {@link IPriceOracleContract}s across different markets share a single
 * `PriceFeedRegistry`, avoiding duplicate contract wrappers for the same
 * on-chain feed.
 **/
export class PriceFeedRegistry extends SDKConstruct {
  #feeds = new AddressMap<IPriceFeedContract>(undefined, "priceFeeds");

  /**
   * Returns all price feeds known to sdk
   */
  public get feeds(): readonly IPriceFeedContract[] {
    return this.#feeds.values();
  }

  /**
   * Checks whether a price feed is already registered at the given address.
   * @param address - On-chain address to look up.
   **/
  public has(address: Address): boolean {
    return this.#feeds.has(address);
  }

  /**
   * Returns the cached price feed contract at the given address, if any.
   * @param address - On-chain address to look up.
   **/
  public get(address: Address): IPriceFeedContract | undefined {
    return this.#feeds.get(address);
  }

  /**
   * Returns the cached price feed contract at the given address.
   * @param address - On-chain address to look up.
   * @throws If no feed is registered at that address.
   **/
  public mustGet(address: Address): IPriceFeedContract {
    return this.#feeds.mustGet(address);
  }

  /**
   * Inserts or updates a price feed from a full tree node.
   *
   * If a fully loaded feed already exists at the same address, only the
   * answer is refreshed. Otherwise a new contract wrapper is created and
   * cached.
   *
   * @param data - Full price feed tree node from the compressor.
   * @returns The cached (or newly created) feed instance.
   * @throws If the created feed is only partially initialized.
   **/
  public upsert(data: PriceFeedTreeNode): IPriceFeedContract {
    const existing = this.#feeds.get(data.baseParams.addr);
    // it's possible to have non-loaded price feed here first from MarketCompressor.getUpdatablePriceFeeds
    // we overwrite them using full tree nodes
    if (existing?.loaded) {
      // assume that when new data(PriceFeedTreeNode) comes for existing price feed,
      // only the answer is mutable and needs to be updated
      existing.updateAnswer(data.answer);
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
   * Instantiates the appropriate price feed contract wrapper based on
   * the `contractType` discriminator in the node's base params.
   *
   * @param data - Partial or full price feed tree node.
   * @returns A new (uncached) feed contract instance.
   * @throws If the contract type is unsupported and strict mode is enabled.
   **/
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

      case "PRICE_FEED::CONSTANT":
        return new ConstantPriceFeedContract(this.sdk, data);

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
}
