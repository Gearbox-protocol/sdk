import { type Address, getAddress, zeroAddress } from "viem";
import type { PriceFeedData } from "../../../model/opportunities.js";
import type { PriceFeed } from "../../core/pricefeed.js";
import type { TreeNode } from "./stress/classify.js";

/**
 * What the store would say about a feed, from what the chain says instead.
 *
 * Two fields are the store's alone and are answered as unknown rather than
 * guessed: who deployed it is a store row, so it is the zero address, and the
 * staleness period is a store setting a feed that was never added does not
 * have, so it is 0. The compressor reports `PRICE_FEED::EXTERNAL` for a
 * contract it cannot otherwise place; an empty type is the same thing said
 * less clearly.
 */
export function onchainPriceFeed(node: TreeNode): PriceFeed {
  return {
    address: getAddress(node.address),
    contractType: node.contractType.trim() || "PRICE_FEED::EXTERNAL",
    version: node.version,
    deployedBy: zeroAddress,
    stalenessPeriod: 0,
    name: node.description.trim(),
  };
}

/**
 * The dependency tree under `feed`, from the nodes the compressor walked, or
 * nothing when it did not reach the feed.
 *
 * Typed the way {@link onchainPriceFeed} types a node, and named after the
 * feed's address when its description is empty, as the backend names a feed
 * it never persisted a name for. A child the walk did not reach is left out,
 * and one already on the path is not re-entered, so a cycle cannot recurse
 * forever.
 */
export function onchainPriceFeedData(
  nodes: ReadonlyMap<Address, TreeNode>,
  feed: Address,
  path: ReadonlySet<Address> = new Set(),
): PriceFeedData | undefined {
  const node = nodes.get(feed);
  if (!node || path.has(feed)) {
    return undefined;
  }
  const below = new Set(path).add(feed);
  return {
    name: node.description.trim() || node.address,
    type: onchainPriceFeed(node).contractType,
    feedAddress: node.address,
    dependencies: node.underlyingFeeds.flatMap(child => {
      const data = onchainPriceFeedData(nodes, child, below);
      return data ? [data] : [];
    }),
  };
}
