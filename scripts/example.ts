import { pino } from "pino";

import { GearboxSDK } from "../src/sdk/index.js";

async function example(): Promise<void> {
  const logger = pino({
    level: process.env.LOG_LEVEL ?? "debug",
  });

  const sdk = await GearboxSDK.attach({
    rpcURLs: [process.env.RPC_URL!],
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
    await sdk.reattach();
  }, 60_000);

  logger.info("done");
}

example().catch(e => {
  console.error(e);
  process.exit(1);
});
