import { writeFile } from "node:fs/promises";
import { pino } from "pino";
import { stringify as yamlStringify } from "yaml";
import { AccountsPlugin } from "../src/plugins/accounts/index.js";
import { AdaptersPlugin } from "../src/plugins/adapters/AdaptersPlugin.js";
import { ApyPlugin } from "../src/plugins/apy/index.js";
import { BotsPlugin } from "../src/plugins/bots/index.js";
import { DegenDistributorsPlugin } from "../src/plugins/degen-distributors/index.js";
import { GearboxSDK, json_stringify } from "../src/sdk/index.js";

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
    // blockNumber: 24736900,
    marketConfigurators: ["0x610627d8d01a413bdd9b0a0b60070da7dd1e54ad"],
    kycFactories: ["0x9bccaf938f7de8cfee02ed5e177f3df873087f5c"],
    logger,
    plugins: {
      adapters: new AdaptersPlugin(true),
      bots: new BotsPlugin(true),
      degen: new DegenDistributorsPlugin(true),
      apy: new ApyPlugin(true),
      accounts: new AccountsPlugin({ includeZeroDebt: true }, true),
      // stalenessV300: V300StalenessPeriodPlugin,
    },
    redstone: {
      historicTimestamp: true,
    },
    pyth: {
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
  //       apy: new ApyPlugin(false),
  //       accountsCounter: new AccountsCounterPlugin(false),
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
    `tmp/state_next_${kind}_human_${net}_${prefix}${sdk.currentBlock}.yaml`,
    yamlStringify(sdk.stateHuman()),
  );
  await writeFile(
    `tmp/state_next_${kind}_${net}_${prefix}${sdk.currentBlock}.json`,
    json_stringify(sdk.state),
  );

  logger.info("done");
}

example().catch(e => {
  logger.error(e);
  process.exit(1);
});
