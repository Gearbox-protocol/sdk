import { pino } from "pino";
import { getAlchemyUrl } from "../src/dev/providers.js";
import type { NetworkType } from "../src/sdk/index.js";
import { json_stringify, MultichainSDK } from "../src/sdk/index.js";

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

function requireUrl(network: NetworkType): string {
  const url = getAlchemyUrl(network, process.env.ALCHEMY_KEY);
  if (!url) {
    throw new Error(`No Alchemy URL for ${network}`);
  }
  return url;
}

async function example(): Promise<void> {
  const sdk = new MultichainSDK({
    chains: {
      Mainnet: { rpcURLs: [requireUrl("Mainnet")], timeout: 120_000 },
      Plasma: { rpcURLs: [requireUrl("Plasma")], timeout: 120_000 },
    },
    logger,
  });
  await sdk.attach();

  const accounts = await sdk.liquidations.getLiquidatableAccounts();
  logger.info(`found ${accounts.length} liquidatable accounts`);
  console.info(json_stringify(accounts));

  const first = accounts[0];
  if (first) {
    const details = await sdk.liquidations.getLiquidationDetails({
      network: first.network,
      creditAccount: first.creditAccount,
    });
    console.info(json_stringify(details));
  }
}

example().catch(e => {
  logger.error(e);
  process.exit(1);
});
