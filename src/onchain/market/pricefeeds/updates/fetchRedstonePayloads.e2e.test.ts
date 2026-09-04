import { type Address, createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { describe, expect, it } from "vitest";

import { fetchRedstonePayloads } from "./fetchRedstonePayloads.js";

// UNI Redstone price feed on mainnet
const UNI_PRICE_FEED: Address = "0xd80ea2de079e3eda7429bcd4a78973c7af1b94f6";

const redstonePriceFeedAbi = [
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
    name: "lastPayloadTimestamp",
    inputs: [],
    outputs: [{ type: "uint40" }],
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

describe("fetchRedstonePayloads", () => {
  it("should fetch UNI price from redstone-primary-prod", async () => {
    const result = await fetchRedstonePayloads({
      dataServiceId: "redstone-primary-prod",
      dataFeedsIds: ["UNI"],
      uniqueSignersCount: 5,
      returnPrices: true,
    });

    expect(result).toHaveLength(1);
    expect(result[0].dataFeedId).toBe("UNI");
    expect(result[0].data).toMatch(/^0x/);
    expect(result[0].timestamp).toBeGreaterThan(0);
    expect(result[0].cached).toBe(false);
    expect(result[0].price).toBeGreaterThan(0n);
    expect(result[0].decimals).toBe(8);
  });

  it("should get updates without returnPrices", async () => {
    const result = await fetchRedstonePayloads({
      dataServiceId: "redstone-primary-prod",
      dataFeedsIds: ["UNI"],
      uniqueSignersCount: 5,
      returnPrices: false,
    });

    expect(result).toHaveLength(1);
    expect(result[0].dataFeedId).toBe("UNI");
    expect(result[0].data).toMatch(/^0x/);
    expect(result[0].timestamp).toBeGreaterThan(0);
    expect(result[0].cached).toBe(false);
    // Without returnPrices, price should not be present
    expect("price" in result[0]).toBe(false);
  });

  it("should return empty array for empty dataFeedsIds", async () => {
    const result = await fetchRedstonePayloads({
      dataServiceId: "redstone-primary-prod",
      dataFeedsIds: [],
      uniqueSignersCount: 5,
    });

    expect(result).toHaveLength(0);
  });

  it("should return price matching on-chain lastPrice after update", async () => {
    const rpcUrl = process.env.RPC_URL;
    if (!rpcUrl) {
      throw new Error("RPC_URL is not set");
    }

    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(rpcUrl),
    });

    // Fetch Redstone payload for UNI
    const result = await fetchRedstonePayloads({
      dataServiceId: "redstone-primary-prod",
      dataFeedsIds: ["UNI"],
      uniqueSignersCount: 5,
      returnPrices: true,
    });

    expect(result).toHaveLength(1);
    const fetchedPrice = result[0].price;
    const fetchedTimestamp = result[0].timestamp;

    const payload = result[0].data;

    // Use viem multicall to simulate: updatePrice then lastPrice
    const [, latestRoundDataResult, lastPayloadTimestampResult] =
      await publicClient.multicall({
        contracts: [
          {
            address: UNI_PRICE_FEED,
            abi: redstonePriceFeedAbi,
            functionName: "updatePrice",
            args: [payload],
          },
          {
            address: UNI_PRICE_FEED,
            abi: redstonePriceFeedAbi,
            functionName: "latestRoundData",
          },
          {
            address: UNI_PRICE_FEED,
            abi: redstonePriceFeedAbi,
            functionName: "lastPayloadTimestamp",
          },
        ],
        allowFailure: false,
        batchSize: 0, // remove calldata size limit
      });

    // latestRoundData returns [roundId, answer, startedAt, updatedAt, answeredInRound]
    const onChainPrice = latestRoundDataResult[1];

    // The fetched price should match the on-chain price after update
    expect(onChainPrice).toBe(fetchedPrice);
    // The fetched timestamp should match the on-chain timestamp after update
    expect(lastPayloadTimestampResult).toBe(fetchedTimestamp);
  });
});
