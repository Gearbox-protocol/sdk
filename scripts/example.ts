import { writeFile } from "node:fs/promises";

import { pino } from "pino";
import { createPublicClient, http } from "viem";

import { GearboxSDK, json_stringify } from "../src/sdk";

async function example(): Promise<void> {
  const logger = pino({
    level: process.env.LOG_LEVEL ?? "debug",
  });

  const client = createPublicClient({
    transport: http("http://127.0.0.1:8545"),
  });
  const block = await client.getBlock({ blockTag: "latest" });
  if (!block) {
    throw new Error("cannot get latest block");
  }
  logger.info(
    { tag: "timing" },
    `optimistic fork block ${block.number} ${new Date(Number(block.timestamp) * 1000)}`,
  );
  // https://github.com/redstone-finance/redstone-oracles-monorepo/blob/c7569a8eb7da1d3ad6209dfcf59c7ca508ea947b/packages/sdk/src/request-data-packages.ts#L82
  // we round the timestamp to full minutes for being compatible with
  // oracle-nodes, which usually work with rounded 10s and 60s intervals
  //
  // Also, when forking anvil->anvil (when running on testnets) block.timestamp can be in future because min ts for block is 1 seconds,
  // and scripts can take dozens of blocks (hundreds for faucet). So we take min value;
  const nowMs = new Date().getTime();
  const redstoneIntervalMs = 60_000;
  const anvilTsMs =
    redstoneIntervalMs *
    Math.floor((Number(block.timestamp) * 1000) / redstoneIntervalMs);
  const fromNowTsMs =
    redstoneIntervalMs * Math.floor(nowMs / redstoneIntervalMs - 1);
  const optimisticTimestamp = Math.min(anvilTsMs, fromNowTsMs);
  const deltaS = Math.floor((nowMs - optimisticTimestamp) / 1000);
  logger.info(
    { tag: "timing" },
    `will use optimistic timestamp: ${new Date(optimisticTimestamp)} (${optimisticTimestamp}, delta: ${deltaS}s)`,
  );

  const sdk = await GearboxSDK.attach({
    rpcURLs: ["http://127.0.0.1:8545"],
    timeout: 480_000,
    addressProvider: "0x81ED8e0325B17A266B2aF225570679cfd635d0bb",
    logger,
    redstoneHistoricTimestamp: optimisticTimestamp,
  });
  logger.info("attached sdk");
  await writeFile(
    "example-state.json",
    json_stringify(sdk.stateHuman()),
    "utf-8",
  );
  logger.info("done");
}

example().catch(e => {
  console.error(e);
  process.exit(1);
});
