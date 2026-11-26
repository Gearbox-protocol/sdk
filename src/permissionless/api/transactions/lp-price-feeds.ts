import { type Address, type PublicClient, parseAbi } from "viem";
import {
  createRawTx,
  type PriceFeedTreeNode,
  type RawTx,
  simulateMulticall,
} from "../../../onchain/index.js";
import { nextLowerBound } from "./nextLowerBound.js";

const ilpPriceFeedAbi = parseAbi([
  "function contractType() external view returns (bytes32)",
  "function setLimiter(uint256 newLimiter) external",
  "function getLPExchangeRate() public view returns (uint256 exchangeRate)",
  "function lowerBound() external view returns (uint256)",
  "function upperBound() external view returns (uint256)",
]);

function currentLowerBound(
  client: PublicClient,
  address: Address,
): Promise<bigint> {
  return client.readContract({
    abi: ilpPriceFeedAbi,
    address,
    functionName: "lowerBound",
  });
}

function getValue(client: PublicClient, address: Address): Promise<bigint> {
  return client.readContract({
    abi: ilpPriceFeedAbi,
    address,
    functionName: "getLPExchangeRate",
  });
}

/**
 * Moves an LP feed's lower bound back under its current exchange rate, when
 * the rate has outgrown the bound or drifted far enough from it to be worth a
 * transaction. Returns nothing when the bound still fits.
 **/
export async function updateBounds(
  client: PublicClient,
  address: Address,
): Promise<RawTx[]> {
  const value = await getValue(client, address);
  const currentLowerBoundValue = await currentLowerBound(client, address);
  const next = nextLowerBound(value, currentLowerBoundValue);
  if (!next) {
    return [];
  }

  return [
    createRawTx(
      address,
      {
        abi: ilpPriceFeedAbi,
        functionName: "setLimiter",
        args: [next.lowerBound],
      },
      `[${address}].setLimiter(${next.lowerBound}); // deviationFromValue: ${(
        100 * next.deviationFromValue
      ).toFixed(2)}%`,
    ),
  ];
}

/** An LP feed found in a feed tree, with what it calls itself on chain. */
export interface LPFeed {
  address: Address;
  description: string;
}

/**
 * Of the feed tree nodes, the ones that are LP feeds: the probe keeps
 * whatever answers `getLPExchangeRate`.
 **/
export async function getFeedsToUpdate(
  client: PublicClient,
  trees: PriceFeedTreeNode[],
): Promise<LPFeed[]> {
  const updateableFeeds = new Map<Address, string>();
  for (const tree of trees) {
    updateableFeeds.set(
      tree.baseParams.addr.toLowerCase() as Address,
      tree.description,
    );
  }

  const candidates = Array.from(updateableFeeds.keys());

  const { results } = await simulateMulticall(client, {
    contracts: candidates.map(feed => ({
      address: feed,
      abi: ilpPriceFeedAbi,
      functionName: "getLPExchangeRate",
    })),
    allowFailure: true,
  });

  return candidates
    .filter((_, index) => results[index]?.status === "success")
    .map(address => ({
      address,
      description: updateableFeeds.get(address) ?? "",
    }));
}
