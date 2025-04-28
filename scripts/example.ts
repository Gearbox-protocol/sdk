import { writeFile } from "node:fs/promises";

import { pino } from "pino";

import {
  GearboxSDK,
  json_stringify,
  V300StalenessPeriodPlugin,
} from "../src/sdk/index.js";

async function example(): Promise<void> {
  const logger = pino({
    level: process.env.LOG_LEVEL ?? "debug",
  });
  // const RPC = "http://127.0.0.1:8545";
  const RPC = process.env.RPC_URL!;
  // const RPC= megaethTestnet.rpcUrls.default.http[0];

  const sdk = await GearboxSDK.attach({
    rpcURLs: [RPC],
    timeout: 480_000,
    // blockNumber: 22118452, // 21977000, // 22118452
    // redstoneHistoricTimestamp: true,
    // addressProvider: ADDRESS_PROVIDER,
    // marketConfigurators: [],
    logger,
    // ignoreUpdateablePrices: true,
    strictContractTypes: true,
    plugins: {
      // adapters: AdaptersPlugin,
      // zappers: ZappersPlugin,
      // bots: BotsPlugin,/
      stalenessV300: V300StalenessPeriodPlugin,
    },
  });

  const prefix = RPC.includes("127.0.0.1") ? "anvil_" : "";
  const net = sdk.provider.networkType;
  await writeFile(
    `tmp/state_human_${net}_${prefix}${sdk.currentBlock}.json`,
    json_stringify(sdk.stateHuman()),
  );
  await writeFile(
    `tmp/state_${net}_${prefix}${sdk.currentBlock}.json`,
    json_stringify(sdk.state),
  );

  logger.info("done");
}

example().catch(e => {
  console.error(e);
  process.exit(1);
});
