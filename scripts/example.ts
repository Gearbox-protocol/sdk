import { writeFile } from "node:fs/promises";
import { pino } from "pino";
import YAML from "yaml";
import { getAlchemyUrl } from "../src/dev/providers.js";
import { GearboxSDK } from "../src/new-sdk/GearboxSDK.js";
import { AccountsPlugin } from "../src/plugins/accounts/index.js";
import { AdaptersPlugin } from "../src/plugins/adapters/AdaptersPlugin.js";
import { BotsPlugin } from "../src/plugins/bots/index.js";
import { DegenDistributorsPlugin } from "../src/plugins/degen-distributors/index.js";
import { AddressSet, json_stringify, MultichainSDK } from "../src/sdk/index.js";

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
  const ALCHEMY_KEY = process.env.ALCHEMY_KEY!;

  const sdk = new MultichainSDK({
    chains: {
      Mainnet: {
        rpcURLs: [getAlchemyUrl("Mainnet", ALCHEMY_KEY)!],
        timeout: 480_000,
      },
      Plasma: {
        rpcURLs: [getAlchemyUrl("Plasma", ALCHEMY_KEY)!],
        timeout: 480_000,
      },
      Etherlink: {
        rpcURLs: [process.env.ETHERLINK_PROVIDER!],
        timeout: 480_000,
      },
      Monad: {
        rpcURLs: [getAlchemyUrl("Monad", ALCHEMY_KEY)!],
        timeout: 480_000,
      },
      Somnia: {
        rpcURLs: [process.env.SOMNIA_PROVIDER!],
        timeout: 480_000,
      },
    },
    plugins: {
      adapters: () => new AdaptersPlugin(true),
      bots: () => new BotsPlugin(true),
      degen: () => new DegenDistributorsPlugin(true),
      accounts: () => new AccountsPlugin({ includeZeroDebt: true }, true),
    },
    logger,
  });
  await sdk.attach();

  await writeFile(
    `tmp/state_multichain_human.yaml`,
    YAML.stringify(sdk.stateHuman()),
  );
  await writeFile(`tmp/state_multichain.json`, json_stringify(sdk.state));

  for (const [network, chainSdk] of sdk.chains) {
    // await writeFile(
    //   `tmp/state_${network}_human_${chainSdk.currentBlock}.yaml`,
    //   YAML.stringify(chainSdk.stateHuman()),
    // );
    // await writeFile(
    //   `tmp/state_${network}_${chainSdk.currentBlock}.json`,
    //   json_stringify(chainSdk.state),
    // );
    const underlyings = new AddressSet();
    for (const market of chainSdk.marketRegister.markets) {
      underlyings.add(market.underlying);
    }
    underlyings.forEach(underlying => {
      console.log(`${network}: ${chainSdk.labelAddress(underlying)}`);
    });
  }

  const gearboxSDK = new GearboxSDK({
    mode: "onchain",
    networks: ["Mainnet", "Plasma", "Etherlink", "Monad", "Somnia"],
    onchain: sdk,
    logger: logger,
  });
  const resp = await gearboxSDK.opportunities.list();
  console.log(json_stringify(resp));

  logger.info("done");
}

example().catch(e => {
  logger.error(e);
  process.exit(1);
});
