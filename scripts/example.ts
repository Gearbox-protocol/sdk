import { writeFile } from "node:fs/promises";

import { pino } from "pino";

import { GearboxSDK, json_stringify } from "../src/sdk/index.js";

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
    },
  });

  const prefix = RPC.includes("127.0.0.1") ? "anvil_" : "";
  await writeFile(
    `state_${prefix}${sdk.currentBlock}.json`,
    json_stringify(sdk.stateHuman()),
  );

  logger.info("done");
}

example().catch(e => {
  console.error(e);
  process.exit(1);
});
