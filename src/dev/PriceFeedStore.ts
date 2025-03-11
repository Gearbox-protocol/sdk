import type {
  AbiParametersToPrimitiveTypes,
  ExtractAbiFunction,
} from "abitype";
import type { Address } from "viem";

import { iPriceFeedCompressorAbi } from "../abi/compressors.js";
import { iPriceFeedStoreAbi } from "../abi/iPriceFeedStore.js";
import type {
  GearboxSDK,
  ILogger,
  PriceFeedTreeNode,
  Unarray,
} from "../sdk/index.js";
import {
  AddressMap,
  AP_PRICE_FEED_COMPRESSOR,
  rawTxToMulticallPriceUpdate,
  SDKConstruct,
} from "../sdk/index.js";

export type ConnectedPriceFeed = Unarray<
  AbiParametersToPrimitiveTypes<
    ExtractAbiFunction<
      typeof iPriceFeedStoreAbi,
      "getTokenPriceFeedsMap"
    >["outputs"]
  >[0]
>;

export class PriceFeedStore extends SDKConstruct {
  readonly #store: Address;
  readonly #compressor: Address;
  readonly #logger?: ILogger;

  constructor(sdk: GearboxSDK) {
    super(sdk);
    this.#store = this.sdk.addressProvider.getAddress("PRICE_FEED_STORE");
    [this.#compressor] = this.sdk.addressProvider.getLatestVersion(
      AP_PRICE_FEED_COMPRESSOR,
    );
    this.#logger = sdk.logger?.child?.({
      module: "PriceFeedStore",
    });
  }

  public async load(update = true): Promise<AddressMap<PriceFeedTreeNode[]>> {
    const pfMap = await this.provider.publicClient.readContract({
      address: this.#store,
      abi: iPriceFeedStoreAbi,
      functionName: "getTokenPriceFeedsMap",
    });
    const addresses = pfMap.flatMap(f => f.priceFeeds);
    const nodes = await this.#loadFromCompressor(addresses, update);
    const result = new AddressMap<PriceFeedTreeNode[]>();
    for (const { token, priceFeeds } of pfMap) {
      result.upsert(
        token,
        priceFeeds
          .map(pf => nodes.find(n => n.baseParams.addr === pf)!)
          .filter(Boolean),
      );
    }
    return result;
  }

  async #loadFromCompressor(
    priceFeeds: Address[],
    update = true,
  ): Promise<PriceFeedTreeNode[]> {
    let result = await this.provider.publicClient.readContract({
      address: this.#compressor,
      abi: iPriceFeedCompressorAbi,
      functionName: "loadPriceFeedTree",
      args: [priceFeeds],
    });
    if (update) {
      const feeds = result.map(f => this.sdk.priceFeeds.create(f));
      const { txs } =
        await this.sdk.priceFeeds.generatePriceFeedsUpdateTxs(feeds);
      const resp = await this.provider.publicClient.multicall({
        contracts: [
          ...txs.map(rawTxToMulticallPriceUpdate),
          {
            address: this.#compressor,
            abi: iPriceFeedCompressorAbi,
            functionName: "loadPriceFeedTree",
            args: [priceFeeds],
          },
        ],
        allowFailure: false,
      });
      result = resp.pop() as PriceFeedTreeNode[];
    }
    this.#logger?.debug(
      `loaded ${result.length} price feed nodes from compressor`,
    );
    return [...result];
  }
}
