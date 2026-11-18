import { getAddress, zeroAddress } from "viem";
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
