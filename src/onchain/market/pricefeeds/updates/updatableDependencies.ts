import type { IPriceFeedContract } from "../types.js";
import { isUpdatablePriceFeed } from "./isUpdatablePriceFeed.js";
import type { IUpdatablePriceFeedContract } from "./types.js";

/**
 * Collects updatable feeds in this feed's dependency tree, including this
 * feed itself when it is updatable.
 **/
export function updatableDependencies(
  feed: IPriceFeedContract,
): IUpdatablePriceFeedContract[] {
  // a feed that was never loaded came from PriceFeedCompressor.getUpdatablePriceFeeds,
  // so it is its own updatable leaf and has no tree to walk
  if (!feed.loaded) {
    return [feed as IUpdatablePriceFeedContract];
  }
  const underlying = feed.underlyingPriceFeeds.flatMap(ref =>
    updatableDependencies(ref.priceFeed),
  );
  return isUpdatablePriceFeed(feed) ? [feed, ...underlying] : underlying;
}
