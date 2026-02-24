import { writeFile } from "node:fs/promises";

import { pino } from "pino";

import { AccountsCounterPlugin } from "../src/plugins/accounts-counter/index.js";
import { AdaptersPlugin } from "../src/plugins/adapters/AdaptersPlugin.js";
import { BotsPlugin } from "../src/plugins/bots/index.js";
import { DegenDistributorsPlugin } from "../src/plugins/degen-distributors/index.js";
import { Pools7DAgoPlugin } from "../src/plugins/pools-history/index.js";
import { chains, GearboxSDK, json_stringify } from "../src/sdk/index.js";

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
  const RPC = "https://anvil.gearbox.foundation/rpc/Securitize";
  const kind = "real";
  // const RPC= megaethTestnet.rpcUrls.default.http[0];

  const sdk = await GearboxSDK.attach({
    rpcURLs: [RPC],
    timeout: 480_000,
    // blockNumber: 23928400,
    // redstoneHistoricTimestamp: true,
    // addressProvider: ADDRESS_PROVIDER,
    marketConfigurators: ["0xe0527de5908b3fc2e054b7eee0def6c9965abf24"],
    logger,
    // ignoreUpdateablePrices: true,
    // strictContractTypes: true,
    plugins: {
      // adapters: new AdaptersPlugin(true),
      // bots: new BotsPlugin(true),
      // degen: new DegenDistributorsPlugin(true),
      // pools7DAgo: new Pools7DAgoPlugin(true),
      // accountsCounter: new AccountsCounterPlugin(true),
      // stalenessV300: V300StalenessPeriodPlugin,
    },
    redstone: {
      ignoreMissingFeeds: true,
      historicTimestamp: true,
    },
    pyth: {
      ignoreMissingFeeds: true,
      historicTimestamp: true,
    },
  });
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
  await sdk.tokensMeta.loadTokenData();
  for (const item of sdk.tokensMeta.phantomTokens.values()) {
    console.log("phantom token", item.symbol, item.addr, item.name);
  }
  for (const item of sdk.tokensMeta.kycUnderlyings.values()) {
    console.log("kyc underlying", item.symbol, item.addr, item.name);
  }
  for (const item of sdk.tokensMeta.dsTokens.values()) {
    console.log("ds token", item.symbol, item.addr, item.name);
  }
  for (const m of sdk.marketRegister.markets) {
    const meta = sdk.tokensMeta.mustGet(m.underlying);
    if (sdk.tokensMeta.isKYCUnderlying(meta)) {
      console.log(
        "market with kyc underlying",
        m.pool.pool.address,
        meta.kycFactory,
        meta.asset,
      );
    }
  }

  const prefix = RPC.includes("127.0.0.1") ? "anvil_" : "";
  const net = sdk.networkType;
  await writeFile(
    `tmp/state_next_${kind}_human_${net}_${prefix}${sdk.currentBlock}.json`,
    json_stringify(sdk.stateHuman()),
  );
  await writeFile(
    `tmp/state_next_${kind}_${net}_${prefix}${sdk.currentBlock}.json`,
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
