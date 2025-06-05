import { writeFile } from "node:fs/promises";

import { pino } from "pino";

import { AdaptersPlugin } from "../src/adapters/AdaptersPlugin.js";
import { BotsPlugin } from "../src/bots/BotsPlugin.js";
import { DegenDistributorsPlugin } from "../src/degenDistributors/DegenDistributorsPlugin.js";
import { AccountsCounterPlugin } from "../src/dev/AccountsCounterPlugin.js";
import { Pools7DAgoPlugin } from "../src/pools7DAgo/Pools7DAgoPlugin.js";
import { GearboxSDK, json_stringify } from "../src/sdk/index.js";
import { ZappersPlugin } from "../src/zappers/ZappersPlugin.js";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "debug",
  formatters: {
    bindings: () => ({}),
    level: label => {
      return {
        level: label,
      };
    },
  },
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
      adapters: AdaptersPlugin,
      zappers: ZappersPlugin,
      bots: BotsPlugin,
      degen: DegenDistributorsPlugin,
      pools7DAgo: Pools7DAgoPlugin,
      accountsCounter: AccountsCounterPlugin,
      // stalenessV300: V300StalenessPeriodPlugin,
    },
    redstone: {
      enableLogging: true,
    },
  });

  // kind = "hydrated";
  // const state = await readFile(
  //   "tmp/state_real_Mainnet_22639985.json",
  //   "utf-8",
  // ).then(json_parse);
  // const sdk = GearboxSDK.hydrate(
  //   {
  //     plugins: {
  //       adapters: AdaptersPlugin,
  //       zappers: ZappersPlugin,
  //       bots: BotsPlugin,
  //       degen: DegenDistributorsPlugin,
  //       pools7DAgo: Pools7DAgoPlugin,
  //       accountsCounter: AccountsCounterPlugin,
  //       // stalenessV300: V300StalenessPeriodPlugin,
  //     },
  //     rpcURLs: [RPC],
  //     timeout: 480_000,
  //     logger,
  //     strictContractTypes: true,
  //   },
  //   state,
  // );

  // const prefix = RPC.includes("127.0.0.1") ? "anvil_" : "";
  // const net = sdk.provider.networkType;
  // await writeFile(
  //   `tmp/state_${kind}_human_${net}_${prefix}${sdk.currentBlock}.json`,
  //   json_stringify(sdk.stateHuman()),
  // );
  // await writeFile(
  //   `tmp/state_${kind}_${net}_${prefix}${sdk.currentBlock}.json`,
  //   json_stringify(sdk.state),
  // );

  sdk.provider.publicClient.watchBlocks({
    onBlock: async block => {
      await sdk.syncState({
        blockNumber: block.number,
        timestamp: block.timestamp,
      });
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
    },
  });

  logger.info("done");
}

example().catch(e => {
  logger.error(e);
  process.exit(1);
});
