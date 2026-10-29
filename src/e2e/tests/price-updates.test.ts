import type { Address } from "viem";
import { beforeAll, describe, expect, it } from "vitest";
import { iPriceFeedAbi } from "../../abi/iPriceFeed.js";
import { OnchainSDK } from "../../sdk/index.js";
import { ANVIL_URL } from "../constants.js";
import { PYTH_API_PROXY, REDSTONE_GATEWAYS, useFixture } from "../helpers.js";

const BLOCK = 24_728_000n;
const MC_EDGE: Address = "0x9dDdd1B9cE0ac8aA0C80E4EC141600b9BF0101C3";
const REDSTONE_FEED: Address = "0x8d6C311590e930E77c2B915d25c5269314fFCCee";
const PYTH_FEED: Address = "0x288D8D49A116480C252F1627671aa431858C31Bf";

async function latestAnswer(sdk: OnchainSDK, address: Address) {
  const result = await sdk.client.readContract({
    address,
    abi: iPriceFeedAbi,
    functionName: "latestRoundData",
  });
  return { answer: result[1], updatedAt: result[3] };
}

describe("price feed updates", () => {
  let sdk: OnchainSDK;

  useFixture({ network: "Mainnet", block: BLOCK });

  beforeAll(async () => {
    sdk = new OnchainSDK("Mainnet", {
      rpcURLs: [ANVIL_URL],
      timeout: 120_000,
    });
    await sdk.attach({
      blockNumber: BLOCK,
      marketConfigurators: [MC_EDGE],
      ignoreUpdateablePrices: true,
      redstone: {
        historicTimestamp: true,
        gateways: REDSTONE_GATEWAYS,
      },
      pyth: {
        historicTimestamp: true,
        apiProxy: PYTH_API_PROXY,
      },
    });
  });

  it.each([
    REDSTONE_FEED,
    PYTH_FEED,
  ])("keeps feed %s readable without generating updates", async address => {
    const initialAnswer = await latestAnswer(sdk, address);
    expect(initialAnswer.answer).toBeGreaterThan(0n);
    expect(sdk.priceFeeds.mustGet(address).updatable).toBe(false);
    expect(await sdk.priceFeeds.generatePriceFeedsUpdateTxs()).toEqual({
      txs: [],
      timestamp: 0,
    });
    expect(
      await sdk.priceFeeds.generateExternalPriceFeedsUpdateTxs([address]),
    ).toEqual({ txs: [], timestamp: 0 });
    expect(await latestAnswer(sdk, address)).toEqual(initialAnswer);
  });
});
