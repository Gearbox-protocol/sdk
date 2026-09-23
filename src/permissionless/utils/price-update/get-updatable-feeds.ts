import { type Address, getContract, type PublicClient } from "viem";
import { priceFeedCompressorAbi } from "../../../abi/compressors/priceFeedCompressor.js";
import type {
  IPriceFeedContract,
  OnchainSDK,
  PriceFeedTreeNode,
} from "../../../onchain/index.js";

export interface GetUpdatablePriceFeedsArgs {
  sdk: OnchainSDK;
  client: PublicClient;
  pfCompressor: Address;
  priceFeeds: Address[];
}

/**
 * @deprecated Support for updatable price feeds is deprecated.
 * @param args
 * @returns
 */
export async function getUpdatablePriceFeeds(
  args: GetUpdatablePriceFeedsArgs,
): Promise<IPriceFeedContract[]> {
  const { sdk, client, pfCompressor, priceFeeds } = args;
  const priceFeedCompressor = getContract({
    address: pfCompressor,
    abi: priceFeedCompressorAbi,
    client,
  });
  const nodes = (await priceFeedCompressor.read.loadPriceFeedTree([
    priceFeeds,
  ])) as PriceFeedTreeNode[];
  return nodes
    .filter(data => data.updatable)
    .map(data => sdk.priceFeeds.create(data));
}
