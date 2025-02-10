import { pino } from "pino";

import { SDKExample } from "../src/dev";

async function example(): Promise<void> {
  const logger = pino({
    level: process.env.LOG_LEVEL ?? "debug",
  });
  const example = new SDKExample(logger);

  const MARKET_CONFIGURATOR = "0x240a60dc5e0b9013cb8cf39aa6f9ddd8f25e40d2";
  const ADDRESS_PROVIDER = "0xf2ef708b652410233d7e1e63ae10a66a64449b88";

  await example.run({
    addressProvider: ADDRESS_PROVIDER,
    marketConfigurators: [MARKET_CONFIGURATOR],
    outFile: "example-state.json",
  });
  logger.info("done");
}

example().catch(e => {
  console.error(e);
  process.exit(1);
});
