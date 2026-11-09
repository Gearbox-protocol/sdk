import { pino } from "pino";
import { ADDRESS_PROVIDER_V310, chains } from "../src/onchain/index.js";
import { TestnetsAPI } from "../src/testnets/index.js";

const logger = pino({
  level: process.env.LOG_LEVEL ?? "debug",
  base: null,
  formatters: {
    level: label => {
      return {
        level: label,
      };
    },
  },
});

async function createTestnet(): Promise<void> {
  const apiKey = process.env.ANVIL_MANAGER_API_KEY;
  if (!apiKey) {
    throw new Error("ANVIL_MANAGER_API_KEY is not set");
  }

  const testnets = new TestnetsAPI({ apiKey, logger });
  const created = await testnets.create({
    description: "Mainnet",
    network: "Mainnet",
    addressProvider: ADDRESS_PROVIDER_V310,
    marketConfigurators: chains.Mainnet.defaultMarketConfigurators.keys(),
    scripts: [
      {
        id: "deploy-faucet",
        docker: "permissionless-scripts:staging",
        timeout: "10m0s",
        args: ["deploy-faucet"],
      },
    ],
    timeout: "1h",
    disableRPCProtection: true,
    backend: { version: "staging-testnet" },
  });
  logger.info(`created testnet ${created.executionId}: ${created.url}`);

  const status = await testnets.waitUntilReady(created.executionId);
  logger.info({ status }, "testnet is ready");
}

createTestnet().catch(e => {
  logger.error(e);
  process.exit(1);
});
