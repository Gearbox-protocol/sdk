import { writeFile } from "node:fs/promises";

import { pino } from "pino";

import { GearboxSDK, json_stringify } from "../src/sdk/index.js";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "debug",
});

async function example(): Promise<void> {
  // const RPC = "http://127.0.0.1:8545";
  const RPC = process.env.RPC_URL!;
  let kind = "real";
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
      // bots: BotsPlugin,
      // stalenessV300: V300StalenessPeriodPlugin,
    },
    // redstone: {
    //   cacheTTL: 0,
    // },
  });

  // kind = "hydrated";
  // const state = await readFile(
  //   "tmp/state_real_Mainnet_22419846.json",
  //   "utf-8",
  // ).then(json_parse);
  // const sdk = GearboxSDK.hydrate(
  //   {
  //     plugins: {
  //       adapters: AdaptersPlugin,
  //       zappers: ZappersPlugin,
  //       bots: BotsPlugin,
  //       stalenessV300: V300StalenessPeriodPlugin,
  //     },
  //     rpcURLs: [RPC],
  //     timeout: 480_000,
  //     logger,
  //     strictContractTypes: true,
  //   },
  //   state,
  // );

  const prefix = RPC.includes("127.0.0.1") ? "anvil_" : "";
  const net = sdk.provider.networkType;
  await writeFile(
    `tmp/state_${kind}_human_${net}_${prefix}${sdk.currentBlock}.json`,
    json_stringify(sdk.stateHuman()),
  );
  await writeFile(
    `tmp/state_${kind}_${net}_${prefix}${sdk.currentBlock}.json`,
    json_stringify(sdk.state),
  );

  sdk.provider.publicClient.watchBlocks({
    onBlock: async block =>
      sdk.syncState({ blockNumber: block.number, timestamp: block.timestamp }),
  });

  logger.info("done");
}

example().catch(e => {
  logger.error(e);
  process.exit(1);
});
