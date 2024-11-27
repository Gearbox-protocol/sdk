import { writeFile } from "node:fs/promises";

import { pino } from "pino";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import {
  GEARBOX_RISK_CURATORS,
  GearboxSDK,
  json_stringify,
  sendRawTx,
} from "../src/sdk";

async function example(): Promise<void> {
  const logger = pino({
    level: process.env.LOG_LEVEL ?? "debug",
  });

  // const sdk = await GearboxSDK.attach({
  //   rpcURLs: ["http://127.0.0.1:8545"],
  //   timeout: 480_000,
  //   addressProvider: "0xF62eEc897fa5ef36a957702AA4a45B58fE8Fe312",
  //   logger,
  //   redstoneHistoricTimestamp: true,
  // });
  const sdk = await GearboxSDK.attach({
    rpcURLs: ["http://127.0.0.1:8545"],
    timeout: 480_000,
    addressProvider: "0xF62eEc897fa5ef36a957702AA4a45B58fE8Fe312",
    logger,
    ignoreUpdateablePrices: true,
    riskCurators: [], // load without risk curator
  });
  const puTx = await sdk.priceFeeds.getUpdatePriceFeedsTx(
    GEARBOX_RISK_CURATORS[sdk.provider.networkType],
  );
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

  await sdk.marketRegister.loadMarkets(
    GEARBOX_RISK_CURATORS[sdk.provider.networkType],
    true,
  );

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
