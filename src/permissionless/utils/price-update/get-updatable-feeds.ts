import { type Address, getContract, type PublicClient } from "viem";
import { priceFeedCompressorAbi } from "../../../abi/compressors/priceFeedCompressor.js";
import {
  bytes32ToString,
  type IPriceFeedContract,
  type OnchainSDK,
  type PriceFeedTreeNode,
  RedstonePriceFeedContract,
} from "../../../onchain/index.js";

export async function getUpdatablePriceFeeds(args: {
  sdk: OnchainSDK;
  client: PublicClient;
  pfCompressor: Address;
  priceFeeds: Address[];
}): Promise<IPriceFeedContract[]> {
  const { sdk, client, pfCompressor, priceFeeds } = args;
  const priceFeedCompressor = getContract({
    address: pfCompressor,
    abi: priceFeedCompressorAbi,
    client,
  });
  const updatablePriceFeeds = (
    (await priceFeedCompressor.read.loadPriceFeedTree([
      priceFeeds,
    ])) as PriceFeedTreeNode[]
  )
    .filter(
      (data: PriceFeedTreeNode) =>
        bytes32ToString(data.baseParams.contractType) ===
        "PRICE_FEED::REDSTONE",
    )
    .map((data: PriceFeedTreeNode) => new RedstonePriceFeedContract(sdk, data));

  return updatablePriceFeeds;
}
