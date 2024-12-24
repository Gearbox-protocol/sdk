import { pino } from "pino";

import { SDKExample } from "../src/dev";

async function example(): Promise<void> {
  const logger = pino({
    level: process.env.LOG_LEVEL ?? "debug",
  });
  const example = new SDKExample(logger);

  const MARKET_CONFIGURATOR = "0x2963ff0196a901ec3F56d7531e7C4Ce8F226462B";
  const ADDRESS_PROVIDER = "0xD69BC314bdaa329EB18F36E4897D96A3A48C3eeF";

  await example.run({
    addressProvider: ADDRESS_PROVIDER,
    marketConfigurator: MARKET_CONFIGURATOR,
    outFile: "example-state.json",
  });
  logger.info("done");
}

example().catch(e => {
  console.error(e);
  process.exit(1);
});
