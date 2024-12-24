import { writeFile } from "node:fs/promises";

import { pino } from "pino";
import type { Address } from "viem";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import { GearboxSDK, json_stringify, sendRawTx } from "../src/sdk";

async function example(): Promise<void> {
  const logger = pino({
    level: process.env.LOG_LEVEL ?? "debug",
  });
  const MARKET_CONFIGURATORS: Address[] = [
    "0x2963ff0196a901ec3F56d7531e7C4Ce8F226462B",
  ];
  const ADDRESS_PROVIDER = "0xD69BC314bdaa329EB18F36E4897D96A3A48C3eeF";

  // const sdk = await GearboxSDK.attach({
  //   rpcURLs: ["http://127.0.0.1:8545"],
  //   timeout: 480_000,
  //   addressProvider: "0xD69BC314bdaa329EB18F36E4897D96A3A48C3eeF",
  //   logger,
  //   redstoneHistoricTimestamp: true,
  // });
  const sdk = await GearboxSDK.attach({
    rpcURLs: ["http://127.0.0.1:8545"],
    timeout: 480_000,
    addressProvider: ADDRESS_PROVIDER,
    logger,
    ignoreUpdateablePrices: true,
    marketConfigurators: [], // load without market configurators
  });
  const puTx = await sdk.priceFeeds.getUpdatePriceFeedsTx(MARKET_CONFIGURATORS);
  const updater = createWalletClient({
    account: privateKeyToAccount(
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", // well-known anvil private key
    ),
    transport: http("http://127.0.0.1:8545"),
  });
  const publicClient = createPublicClient({
    transport: http("http://127.0.0.1:8545"),
  });
  const hash = await sendRawTx(updater, { tx: puTx });
  await publicClient.waitForTransactionReceipt({ hash });

  await sdk.marketRegister.loadMarkets(MARKET_CONFIGURATORS, true);

  logger.info("attached sdk");
  await writeFile(
    "example-state.json",
    json_stringify(sdk.stateHuman()),
    "utf-8",
  );
  logger.info("done");
}

example().catch(e => {
  console.error(e);
  process.exit(1);
});
