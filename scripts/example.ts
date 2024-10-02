import { writeFile } from "node:fs/promises";

import { pino } from "pino";

import { GearboxSDK, json_stringify } from "../src/sdk";

async function example(): Promise<void> {
  const logger = pino({
    level: process.env.LOG_LEVEL ?? "debug",
  });

  const sdk = await GearboxSDK.attach({
    rpcURLs: ["http://127.0.0.1:8545"],
    timeout: 480_000,
    addressProvider: "0x81ED8e0325B17A266B2aF225570679cfd635d0bb",
    logger,
  });
  await writeFile("example-state.json", json_stringify(sdk.state), "utf-8");
}

example().catch(e => {
  console.error(e);
  process.exit(1);
});
