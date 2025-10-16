import { type Address, getContract, type PublicClient } from "viem";
import { priceFeedCompressorAbi } from "../../../abi/compressors/priceFeedCompressor.js";
import {
  type GearboxSDK,
  type IPriceFeedContract,
  type PriceFeedTreeNode,
  PythPriceFeed,
  RedstonePriceFeedContract,
} from "../../../sdk/index.js";
import { bytes32ToString } from "../../../sdk/utils/index.js";

export async function getUpdatablePriceFeeds(args: {
  sdk: GearboxSDK;
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
    .filter((data: PriceFeedTreeNode) =>
      ["PRICE_FEED::PYTH", "PRICE_FEED::REDSTONE"].includes(
        bytes32ToString(data.baseParams.contractType),
      ),
    )
    .map((data: PriceFeedTreeNode) => {
      if (
        bytes32ToString(data.baseParams.contractType) === "PRICE_FEED::PYTH"
      ) {
        return new PythPriceFeed(sdk, data);
      }
      return new RedstonePriceFeedContract(sdk, data);
    });

  return updatablePriceFeeds;
}
