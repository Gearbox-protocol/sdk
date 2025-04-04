import { writeFile } from "node:fs/promises";

import { pino } from "pino";
import type { Hex } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { megaethTestnet } from "viem/chains";

import { AdaptersPlugin } from "../src/adapters/index.js";
import { AccountOpener } from "../src/dev/index.js";
import {
  CreditAccountsService,
  GearboxSDK,
  json_stringify,
} from "../src/sdk/index.js";

async function example(): Promise<void> {
  const logger = pino({
    level: process.env.LOG_LEVEL ?? "debug",
  });

  const sdk = await GearboxSDK.attach({
    rpcURLs: [...megaethTestnet.rpcUrls.default.http],
    timeout: 480_000,
    // blockNumber: 22118452, // 21977000, // 22118452
    // redstoneHistoricTimestamp: true,
    // addressProvider: ADDRESS_PROVIDER,
    // marketConfigurators: [],
    logger,
    // ignoreUpdateablePrices: true,
    strictContractTypes: true,
    plugins: {
      adapters: AdaptersPlugin,
      // zappers: ZappersPlugin,
      // bots: BotsPlugin,/
    },
  });
  const now = Math.floor(Date.now() / 1000);

  await writeFile(
    `tmp/state_human_${now}.json`,
    json_stringify(sdk.stateHuman()),
  );

  const cas = new CreditAccountsService(sdk);
  const opener = new AccountOpener(cas, {
    borrower: privateKeyToAccount(process.env.MEGAETH_PRIVATE_KEY! as Hex),
  });

  const result = await opener.openCreditAccounts(
    [
      {
        creditManager: "0x6345cec9acEF5DbAD06F8c5341C053964BbBCd18",
        // target: "0xE9b6e75C243B6100ffcb1c66e8f78F96FeeA727F", // cUSD underlying
        target: "0x776401b9BC8aAe31A685731B7147D4445fD9FB19", // WETH
        slippage: 100,
      },
    ],
    false,
    false,
  );

  await writeFile(`tmp/result_${now}.json`, json_stringify(result));

  logger.info("done");
}

example().catch(e => {
  console.error(e);
  process.exit(1);
});
