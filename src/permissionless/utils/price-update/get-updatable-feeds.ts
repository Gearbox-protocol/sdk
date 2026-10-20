import type { Address, PublicClient } from "viem";
import type { GearboxSDK, IPriceFeedContract } from "../../../sdk/index.js";

/** @deprecated Support for updatable price feeds is disabled. */
export async function getUpdatablePriceFeeds(_args: {
  sdk: GearboxSDK;
  client: PublicClient;
  pfCompressor: Address;
  priceFeeds: Address[];
}): Promise<IPriceFeedContract[]> {
  return [];
}
