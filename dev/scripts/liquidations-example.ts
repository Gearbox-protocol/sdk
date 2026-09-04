import { pino } from "pino";
import { getAlchemyUrl } from "../../src/dev/providers.js";
import type { NetworkType } from "../../src/onchain/index.js";
import {
  getNetworkType,
  json_stringify,
  MultichainSDK,
} from "../../src/onchain/index.js";

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

  const { data: accounts, meta } =
    await sdk.liquidations.getLiquidatableAccounts();
  logger.info(meta, `found ${accounts.length} liquidatable accounts`);
  console.info(json_stringify(accounts));

  const first = accounts[0];
  if (first) {
    const { data: details } = await sdk.liquidations.getLiquidationDetails({
      network: getNetworkType(first.chainId),
      creditAccount: first.creditAccount,
    });
    console.info(json_stringify(details));
  }
}

example().catch(e => {
  logger.error(e);
  process.exit(1);
});
