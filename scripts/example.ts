import { readFile, writeFile } from "node:fs/promises";

import { pino } from "pino";
import { AccountOpener } from "../src/dev/AccountOpener.js";
import { AccountsCounterPlugin } from "../src/plugins/accounts-counter/index.js";
import { BotsPlugin } from "../src/plugins/bots/index.js";
import { DegenDistributorsPlugin } from "../src/plugins/degen-distributors/index.js";
import { Pools7DAgoPlugin } from "../src/plugins/pools-history/index.js";
import { ZappersPlugin } from "../src/plugins/zappers/index.js";
import { CreditAccountServiceV310 } from "../src/sdk/accounts/CreditAccountsServiceV310.js";
import {
  GearboxSDK,
  type IPriceFeedContract,
  json_stringify,
} from "../src/sdk/index.js";

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
  const kind = "real";
  // const RPC= megaethTestnet.rpcUrls.default.http[0];

  const sdk = await GearboxSDK.attach({
    rpcURLs: [RPC],
    timeout: 480_000,
    // blockNumber: 22118452, // 21977000, // 22118452
    // redstoneHistoricTimestamp: true,
    // addressProvider: ADDRESS_PROVIDER,
    marketConfigurators: ["0x7A133FBd01736Fd076158307c9476cC3877F1AF5"],
    logger,
    // ignoreUpdateablePrices: true,
    strictContractTypes: true,
    plugins: {
      // zappers: new ZappersPlugin([], true),
      // bots: new BotsPlugin(true),
      // degen: new DegenDistributorsPlugin(true),
      // pools7DAgo: new Pools7DAgoPlugin(true),
      // accountsCounter: new AccountsCounterPlugin(true),
      // stalenessV300: V300StalenessPeriodPlugin,
    },
    redstone: {
      enableLogging: true,
      historicTimestamp: true,
    },
    pyth: {
      historicTimestamp: true,
    },
  });
  logger.flush();
  logger.info("--------------------------------");
  const cm = "0x8c118E8C20CEbbaa2467b735BBB8B13d614e6608";
  const feed = sdk.contracts.mustGet(
    "0x2Ca87FDbFD032000EA24A78389032130fb433e6a",
  ) as any as IPriceFeedContract;
  logger.debug(
    { address: feed.address, priceFeedType: feed.priceFeedType },
    "got feed",
  );

  const cas = new CreditAccountServiceV310(sdk);
  const updates = await cas.getPriceUpdatesForFacade(cm, undefined, [
    { token: "0x40fc1f58ab6efc06e008370a040e92b635dd4ce4", balance: 1000000n },
  ]);
  logger.debug({ updates }, "got updates");

  // const opn = new AccountOpener(cas).openCreditAccounts(
  //   [
  //     {
  //       creditManager: cm,
  //       target: "0x40fc1f58ab6efc06e008370a040e92b635dd4ce4",
  //       leverage: 5,
  //     },
  //   ],
  //   false,
  //   false,
  // );
  // logger.debug({ opn }, "opn");

  // kind = "hydrated";
  // const state = await readFile(
  //   "tmp/state_real_Mainnet_22798015.json",
  //   "utf-8",
  // ).then(json_parse);
  // const sdk = GearboxSDK.hydrate(
  //   {
  //     plugins: {
  //       adapters: new AdaptersPlugin(false),
  //       zappers: new ZappersPlugin(false),
  //       bots: new BotsPlugin(false),
  //       degen: new DegenDistributorsPlugin(false),
  //       pools7DAgo: new Pools7DAgoPlugin(false),
  //       accountsCounter: new AccountsCounterPlugin(false),
  //       // stalenessV300: V300StalenessPeriodPlugin,
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

  // sdk.provider.publicClient.watchBlocks({
  //   onBlock: async block => {
  //     await sdk.syncState({
  //       blockNumber: block.number,
  //       timestamp: block.timestamp,
  //     });
  //     // const prefix = RPC.includes("127.0.0.1") ? "anvil_" : "";
  //     // const net = sdk.provider.networkType;
  //     // await writeFile(
  //     //   `tmp/state_${kind}_human_${net}_${prefix}${sdk.currentBlock}.json`,
  //     //   json_stringify(sdk.stateHuman()),
  //     // );
  //     // await writeFile(
  //     //   `tmp/state_${kind}_${net}_${prefix}${sdk.currentBlock}.json`,
  //     //   json_stringify(sdk.state),
  //     // );
  //   },
  // });

  logger.info("done");
}

example().catch(e => {
  logger.error(e);
  process.exit(1);
});
