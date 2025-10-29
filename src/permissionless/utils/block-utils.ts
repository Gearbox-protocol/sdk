import type { PublicClient } from "viem";

/**
 * Finds the block number closest to a given timestamp using binary search
 * @param client - The PublicClient instance for blockchain interaction
 * @param targetTimestamp - The timestamp to find the closest block for
 * @returns Promise<number> - The block number closest to the target timestamp
 */
export async function getBlockNumberByTimestamp(
  client: PublicClient,
  targetTimestamp: number,
): Promise<number> {
  // Get the latest block to use as upper bound
  const latestBlock = await client.getBlock({ blockTag: "latest" });
  const latestBlockNumber = Number(latestBlock.number);
  const latestTimestamp = Number(latestBlock.timestamp);

  // If target timestamp is after latest block, return latest block
  if (targetTimestamp >= latestTimestamp) {
    return latestBlockNumber;
  }

  // Binary search to find the closest block
  let left = 0;
  let right = latestBlockNumber;
  let closestBlock = latestBlockNumber;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);

    // Get the block at mid point
    const block = await client.getBlock({
      blockNumber: BigInt(mid),
    });
    const blockTimestamp = Number(block.timestamp);

    if (blockTimestamp === targetTimestamp) {
      return mid;
    }

    if (blockTimestamp < targetTimestamp) {
      left = mid + 1;
    } else {
      right = mid - 1;
      closestBlock = mid;
    }
  }

  return closestBlock;
}
