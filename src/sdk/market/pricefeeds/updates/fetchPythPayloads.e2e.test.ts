import { type Address, createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect, it } from "vitest";

import { fetchPythPayloads } from "./fetchPythPayloads.js";

// USDC Pyth price feed on mainnet
const PYTH_PRICE_FEED: Address = "0x288d8d49a116480c252f1627671aa431858c31bf";
// USDC price feed ID
const USDC_FEED_ID =
  "0xeaa020c61cc479712813461ce153894a96a6c00b21ed0cfc2798d1f9a9e9c94a";

const pythPriceFeedAbi = [
  {
    type: "function",
    name: "latestRoundData",
    inputs: [],
    outputs: [
      { name: "roundId", type: "uint80" },
      { name: "answer", type: "int256" },
      { name: "startedAt", type: "uint256" },
      { name: "updatedAt", type: "uint256" },
      { name: "answeredInRound", type: "uint80" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "updatePrice",
    inputs: [{ name: "data", type: "bytes", internalType: "bytes" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

describe("fetchPythPayloads", () => {
  it("should get updates without returnPrices", async () => {
    const result = await fetchPythPayloads({
      dataFeedsIds: [USDC_FEED_ID],
      returnPrices: false,
    });

    expect(result).toHaveLength(1);
    expect(result[0].dataFeedId.toLowerCase()).toBe(USDC_FEED_ID.toLowerCase());
    expect(result[0].data).toMatch(/^0x/);
    expect(result[0].timestamp).toBeGreaterThan(0);
    expect(result[0].cached).toBe(false);
    // Without returnPrices, price should not be present
    expect("price" in result[0]).toBe(false);
  });

  it("should return empty array for empty dataFeedsIds", async () => {
    const result = await fetchPythPayloads({
      dataFeedsIds: [],
    });

    expect(result).toHaveLength(0);
  });

  it("should update on-chain price and timestamp after updatePrice", async () => {
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
      throw new Error("RPC_URL is not set");
    }

    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(rpcUrl),
    });

    // Fetch Pyth payload for USDC
    const result = await fetchPythPayloads({
      dataFeedsIds: [USDC_FEED_ID],
      returnPrices: true,
    });

    expect(result).toHaveLength(1);
    const fetchedTimestamp = result[0].timestamp;
    const fetchedPrice = result[0].price;
    const payload = result[0].data;

    // Use viem multicall to simulate: updatePrice then latestRoundData
    const [, latestRoundDataResult] = await publicClient.multicall({
      contracts: [
        {
          address: PYTH_PRICE_FEED,
          abi: pythPriceFeedAbi,
          functionName: "updatePrice",
          args: [payload],
        },
        {
          address: PYTH_PRICE_FEED,
          abi: pythPriceFeedAbi,
          functionName: "latestRoundData",
        },
      ],
      allowFailure: false,
      batchSize: 0, // remove calldata limit
    });

    // latestRoundData returns [roundId, answer, startedAt, updatedAt, answeredInRound]
    // answer is the price (index 1), updatedAt is the timestamp (index 3)
    const onChainPrice = latestRoundDataResult[1];
    const onChainTimestamp = latestRoundDataResult[3];

    // The on-chain price should be equal to the fetched price
    expect(onChainPrice).toBe(fetchedPrice);

    // The fetched timestamp should match the on-chain timestamp after update
    expect(onChainTimestamp).toBe(BigInt(fetchedTimestamp));
  });
});
