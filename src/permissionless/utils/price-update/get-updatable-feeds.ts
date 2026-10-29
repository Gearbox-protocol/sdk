import type { Address, PublicClient } from "viem";
import type { IPriceFeedContract, OnchainSDK } from "../../../sdk/index.js";

/** Pyth and RedStone updates are disabled; retained for compatibility. */
export async function getUpdatablePriceFeeds(_args: {
  sdk: OnchainSDK;
  client: PublicClient;
  pfCompressor: Address;
  priceFeeds: Address[];
}): Promise<IPriceFeedContract[]> {
  return [];
}
