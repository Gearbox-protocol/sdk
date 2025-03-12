import { pino } from "pino";
import type { Address } from "viem";

import { GearboxAdaptersPlugin } from "../src/adapters/index.js";
import { GearboxSDK } from "../src/sdk/index.js";
import { GearboxZappersPlugin } from "../src/zappers/index.js";

async function example(): Promise<void> {
  const logger = pino({
    level: process.env.LOG_LEVEL ?? "debug",
  });

  const MARKET_CONFIGURATORS: Address[] = [
    "0x354fe9f450f60b8547f88be042e4a45b46128a06",
  ];
  const ADDRESS_PROVIDER = "0xbab2014dd88223e168ba06911c06df638311a097";

  const sdk = await GearboxSDK.attach({
    rpcURLs: ["https://anvil.gearbox.foundation/rpc/PermissionlessMainnet"],
    timeout: 480_000,
    addressProvider: ADDRESS_PROVIDER,
    marketConfigurators: MARKET_CONFIGURATORS,
    logger,
    ignoreUpdateablePrices: false,
    strictContractTypes: true,
    plugins: {
      adapters: GearboxAdaptersPlugin,
      zappers: GearboxZappersPlugin,
    },
  });

  logger.info("done");
  logger.info(`loaded ${sdk.plugins.zappers.zappers.size} zappers`);
}

example().catch(e => {
  console.error(e);
  process.exit(1);
});
