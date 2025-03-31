import { pino } from "pino";

import { GearboxSDK } from "../src/sdk/index.js";

async function example(): Promise<void> {
  const logger = pino({
    level: process.env.LOG_LEVEL ?? "debug",
  });

  const RPC =
    "https://eth-mainnet.g.alchemy.com/v2/Xwmj_keleIxuZYSbdQ4qsqQVvBRRFOYk";

  const sdk = await GearboxSDK.attach({
    rpcURLs: [RPC],
    timeout: 480_000,
    // redstoneHistoricTimestamp: true,
    // addressProvider: ADDRESS_PROVIDER,
    // marketConfigurators: [...confgurators],
    logger,
    ignoreUpdateablePrices: false,
    strictContractTypes: true,
    plugins: {
      // adapters: AdaptersPlugin,
      // zappers: ZappersPlugin,
      // bots: BotsPlugin,/
    },
  });

  setInterval(async () => {
    await sdk.syncState();
  }, 60_000);

  logger.info("done");
}

example().catch(e => {
  console.error(e);
  process.exit(1);
});
