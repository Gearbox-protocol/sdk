import { writeFile } from "node:fs/promises";

import { pino } from "pino";

import { GearboxSDK, json_stringify } from "../src";

async function example(): Promise<void> {
  const logger = pino({
    level: process.env.LOG_LEVEL ?? "debug",
  });

  const sdk = await GearboxSDK.attach({
    rpcURL: "http://127.0.0.1:8545",
    timeout: 480_000,
    addressProvider: "0x5fe2f174fe51474Cd198939C96e7dB65983EA307",
    logger,
  });
  await writeFile("example-state.json", json_stringify(sdk.state), "utf-8");
}

example().catch(e => {
  console.error(e);
  process.exit(1);
});
