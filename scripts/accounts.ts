import { pino } from "pino";
import type { Address } from "viem";
import { createPublicClient, createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";

import type { TargetAccount } from "../src/dev";
import { AccountOpener } from "../src/dev";
import { CreditAccountsService, GearboxSDK, sendRawTx } from "../src/sdk";

async function accounts(): Promise<void> {
  const logger = pino({
    level: process.env.LOG_LEVEL ?? "debug",
  });
  const MARKET_CONFIGURATORS: Address[] = [
    "0x2963ff0196a901ec3F56d7531e7C4Ce8F226462B",
  ];
  const ADDRESS_PROVIDER = "0x5147c5C1Cb5b5D3f56186C37a4bcFBb3Cd0bD5A7";

  const sdk = await GearboxSDK.attach({
    rpcURLs: ["http://127.0.0.1:8545"],
    timeout: 480_000,
    addressProvider: ADDRESS_PROVIDER,
    logger,
    ignoreUpdateablePrices: true,
    marketConfigurators: [], // load without market configurators
  });
  const puTx = await sdk.priceFeeds.getUpdatePriceFeedsTx([]);
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

  const caService = new CreditAccountsService(sdk);
  const opener = new AccountOpener(caService);

  const targets: TargetAccount[] = [];
  // open simple accounts in underlying only
  for (const cm of sdk.marketRegister.creditManagers) {
    targets.push({
      creditManager: cm.creditManager.address,
      collateral: cm.creditManager.underlying,
    });
  }

  await opener.openCreditAccounts(targets);

  logger.info("done");
}

accounts().catch(e => {
  console.error(e);
  process.exit(1);
});
