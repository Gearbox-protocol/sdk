import { type Address, isAddressEqual } from "viem";
import { beforeAll, describe, expect, it } from "vitest";
import { iPriceFeedAbi } from "../../abi/iPriceFeed.js";
import {
  OnchainSDK,
  sendRawTx,
  type UpdatePriceFeedsResult,
} from "../../sdk/index.js";
import { ANVIL_URL } from "../constants.js";
import { getAnvilWallet, REDSTONE_GATEWAYS, useFixture } from "../helpers.js";

const BLOCK = 24_728_000n;
const MC_EDGE: Address = "0x9dDdd1B9cE0ac8aA0C80E4EC141600b9BF0101C3";
const REDSTONE_FEED: Address = "0x8d6C311590e930E77c2B915d25c5269314fFCCee";

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
  let txs: UpdatePriceFeedsResult;

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
    });
    txs = await sdk.priceFeeds.generatePriceFeedsUpdateTxs();
  });

  it("should fetch and apply redstone update", async () => {
    const initialAnswer = await latestAnswer(sdk, REDSTONE_FEED);
    expect(initialAnswer).toEqual({
      answer: 23822382n,
      updatedAt: 1773865460n,
    });

    const tx = txs.txs.find(tx => isAddressEqual(tx.raw.to, REDSTONE_FEED))!;

    expect(tx).toMatchObject({
      data: {
        cached: false,
        dataFeedId: "CRV",
        dataServiceId: "redstone-primary-prod",
        priceFeed: "0x8d6C311590e930E77c2B915d25c5269314fFCCee",
        timestamp: 1774362540,
      },
      name: "redstone",
      raw: {
        callData: expect.any(String),
        contractInputsValues: {
          data: expect.any(String),
        },
        signature: "updatePrice(bytes)",
        to: "0x8d6C311590e930E77c2B915d25c5269314fFCCee",
        value: "0",
      },
    });
    const wallet = getAnvilWallet(sdk);

    const hash = await sendRawTx(wallet, {
      tx: {
        to: tx.raw.to,
        callData: tx.raw.callData,
        value: tx.raw.value,
      },
    });
    const receipt = await sdk.client.waitForTransactionReceipt({ hash });
    expect(receipt.status).toBe("success");

    const newAnswer = await latestAnswer(sdk, REDSTONE_FEED);
    expect(newAnswer).toEqual({
      answer: 22231696n,
      updatedAt: 1774362540n,
    });

    expect(newAnswer).not.toEqual(initialAnswer);
  });
});
