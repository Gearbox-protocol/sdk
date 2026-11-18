import {
  type Address,
  decodeFunctionResult,
  encodeFunctionData,
  type PublicClient,
  parseAbi,
} from "viem";
import { priceFeedCompressorAbi } from "../../../abi/compressors/priceFeedCompressor.js";
import {
  createRawTx,
  type PriceFeedTreeNode,
  type RawTx,
  simulateMulticall,
} from "../../../onchain/index.js";

const LOWER_BOUND_FACTOR = 999n;

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

function toLowerBound(value: bigint): bigint {
  return (value * LOWER_BOUND_FACTOR) / 1000n;
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
  const lowerBound = toLowerBound(value);

  const deviationFromValue =
    Math.floor(
      Number(
        (10_000n * (value - currentLowerBoundValue)) / currentLowerBoundValue,
      ),
    ) / 10_000;

  const deviationFromBound =
    Math.floor(
      Number(
        (10_000n * (lowerBound - currentLowerBoundValue)) /
          currentLowerBoundValue,
      ),
    ) / 10_000;

  const txs: RawTx[] = [];

  if (deviationFromValue < 0 || Math.abs(deviationFromBound) > 0.005) {
    txs.push(
      createRawTx(
        address,
        {
          abi: ilpPriceFeedAbi,
          functionName: "setLimiter",
          args: [lowerBound],
        },
        `[${address}].setLimiter(${lowerBound}); // deviationFromValue: ${(
          100 * deviationFromValue
        ).toFixed(2)}%`,
      ),
    );
  }
  return txs;
}

/** An LP feed found in a feed tree, with what it calls itself on chain. */
export interface LPFeed {
  address: Address;
  description: string;
}

/**
 * Of the whole feed tree behind `feeds`, the ones that are LP feeds: the
 * probe keeps whatever answers `getLPExchangeRate`.
 *
 * The trees reach past `feeds` themselves, so an LP feed read inside one of
 * them is among the results whether or not it is one of `feeds`.
 **/
export async function getFeedsToUpdate(
  client: PublicClient,
  pfCompressor: Address,
  feeds: Address[],
): Promise<LPFeed[]> {
  const updateableFeeds = new Map<Address, string>();
  const { data } = await client.call({
    to: pfCompressor,
    data: encodeFunctionData({
      abi: priceFeedCompressorAbi,
      functionName: "loadPriceFeedTree",
      args: [feeds],
    }),
    gas: 200_000_000n,
  });
  const trees = decodeFunctionResult({
    abi: priceFeedCompressorAbi,
    functionName: "loadPriceFeedTree",
    data: data ?? "0x",
  }) as PriceFeedTreeNode[];
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
