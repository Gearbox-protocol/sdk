import { pino } from "pino";
import type { Address } from "viem";

import { SDKExample } from "../src/dev/index.js";

async function example(): Promise<void> {
  const logger = pino({
    level: process.env.LOG_LEVEL ?? "debug",
  });
  const example = new SDKExample(logger);

  const MARKET_CONFIGURATORS: Address[] = [
    "0x372eb7d6f8fae884d9b9b5114f26897416a00c21",
    "0xbba2ad00ecbd7d22cc6d2c61afa53e27d14f136e",
  ];
  const ADDRESS_PROVIDER = "0xf7711bf911b246ad90b6c6795c53eab3255ab56a";

  await example.run({
    addressProvider: ADDRESS_PROVIDER,
    marketConfigurators: MARKET_CONFIGURATORS,
    outFile: "example-state.json",
    anvilUrl: "https://anvil.gearbox.foundation/rpc/Eth211",
  });
  logger.info("done");
}

example().catch(e => {
  console.error(e);
  process.exit(1);
});
