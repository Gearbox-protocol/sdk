import { beforeAll, expect, it } from "vitest";

import { GearboxSDK } from "../../../GearboxSDK.js";
import type { IPriceFeedContract } from "../types.js";
import { RedstoneUpdater } from "./RedstoneUpdater.js";

let sdk: GearboxSDK;
beforeAll(async () => {
  if (process.env.CI === "true") {
    // this test requires anvil rpc
    return;
  }
  sdk = await GearboxSDK.attach({
    rpcURLs: [process.env.RPC_URL!],
    timeout: 480_000,
    strictContractTypes: true,
    blockNumber: 22648335,
    redstone: {
      historicTimestamp: true,
      ignoreMissingFeeds: true,
    },
  });
});

it("should return an empty array when no updates are available", async () => {
  if (process.env.CI === "true") {
    // this test requires anvil rpc
    return;
  }
  const ezETHFeed = sdk.mustGetContract<IPriceFeedContract>(
    "0xa7cB34Cd731486F61cfDb7ff5F6fC7B40537eD76",
  );
  const updated = new RedstoneUpdater(sdk, {
    historicTimestamp: true,
    ignoreMissingFeeds: true,
  });
  const txs = await updated.getUpdateTxs([ezETHFeed]);
  expect(txs).toHaveLength(1);
  expect(txs[0].data).toEqual({
    cached: false,
    dataFeedId: "ezETH_FUNDAMENTAL",
    dataServiceId: "redstone-primary-prod",
    priceFeed: "0xa7cB34Cd731486F61cfDb7ff5F6fC7B40537eD76",
    timestamp: 1749246540,
  });
  expect(txs[0].raw).toEqual({
    callData: expect.any(String),
    contractInputsValues: {
      data: expect.any(String),
    },
    contractMethod: {
      inputs: [
        {
          internalType: "bytes",
          name: "data",
          type: "bytes",
        },
      ],
      name: "updatePrice",
      payable: false,
    },
    description:
      "updating redstone price for ezETH_FUNDAMENTAL [0xa7cB34Cd731486F61cfDb7ff5F6fC7B40537eD76 [RedstonePriceFeed ezETH / USD Redstone price feed]]",
    signature: "updatePrice(bytes)",
    to: "0xa7cB34Cd731486F61cfDb7ff5F6fC7B40537eD76",
    value: "0",
  });
  const second = await updated.getUpdateTxs([ezETHFeed]);
  expect(second[0].data).toMatchObject({
    cached: true,
  });

  await expect(
    sdk.client.call({
      to: txs[0].raw.to,
      data: txs[0].raw.callData,
      blockNumber: sdk.currentBlock,
    }),
  ).resolves.not.toThrow();
});
