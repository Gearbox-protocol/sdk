/**
 * Generates the fork RPC cache fixtures of the curator's executed-GIP e2e
 * tests (src/e2e/tests/curator-executed-gips.test.ts).
 *
 * Usage:
 *   tsx --env-file .env dev/scripts/generate-curator-gip-fixtures.ts [filter…]
 *
 * Filters match a GIP's id or name; without one, every GIP is generated.
 *
 * Environment:
 *   RPC_URL - Archive node RPC URL (required)
 *
 * For each GIP, Anvil forks the block before its execution and the
 * reproduction runs as its test runs it, so the cache Anvil flushes on exit
 * holds everything the test reads. A GIP that does not reproduce gets no
 * fixture.
 **/

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { http } from "viem";
import { createAnvilClient } from "../../src/dev/createAnvilClient.js";
import {
  anvilCachePath,
  startAnvilFork,
  stopAnvil,
} from "../../src/e2e/anvil.js";
import { executedGips } from "../../src/e2e/curator/executedGips.js";
import {
  describeSimulation,
  reproduceExecutedGip,
  simulationMatches,
} from "../../src/e2e/curator/reproduceExecutedGip.js";
import { chains } from "../../src/onchain/index.js";

const RPC_URL = process.env.RPC_URL ?? "";
if (!RPC_URL) {
  console.error("RPC_URL environment variable is required");
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = resolve(__dirname, "../../src/e2e/fixtures");
const ANVIL_PORT = 8546;
/**
 * Anvil >= 1.7 flushes its cache zstd-compressed; fixtures are plain JSON,
 * decompressed with the `zstd` CLI.
 **/
const ZSTD_MAGIC = "28b52ffd";

const filters = process.argv.slice(2);
const selected = executedGips.filter(
  ({ gip }) =>
    filters.length === 0 ||
    filters.some(f => gip.id.includes(f) || gip.name.includes(f)),
);

async function main() {
  const chainId = chains.Mainnet.id;
  for (const reproduction of selected) {
    const { gip } = reproduction;
    const block = gip.executedAtBlock - 1n;
    console.log(`\n=== ${gip.name} (${gip.id}), block ${block} ===`);

    // One Anvil run per builder: see `ReproduceOptions`. Each run loads the
    // cache the previous one flushed, so the last flush holds them all.
    let builderCount = 1;
    for (let builderIndex = 0; builderIndex < builderCount; builderIndex++) {
      const anvil = await startAnvilFork({
        forkUrl: RPC_URL,
        forkBlockNumber: block,
        port: ANVIL_PORT,
      });
      try {
        // As `useFixture` does: one second per block, not the wall clock.
        await createAnvilClient({
          transport: http(anvil.url),
        }).setBlockTimestampInterval({ interval: 1 });

        const result = await reproduceExecutedGip(reproduction, anvil.url, {
          builderIndex,
          isolation: "none",
        });
        builderCount = result.builderCount;
        const sameCalls =
          result.builtHashes.length === gip.timelockTxHashes.length &&
          result.builtHashes.every(
            (hash, i) => hash === gip.timelockTxHashes[i],
          );
        if (!sameCalls) {
          throw new Error("built payload calls differ from the executed ones");
        }
        for (const { label, outcome } of result.simulations) {
          if (!simulationMatches(outcome)) {
            throw new Error(`${label}: ${describeSimulation(outcome)}`);
          }
          console.log(
            `[gip] ${result.builtHashes.length} calls identical; ${label} matches`,
          );
        }
      } finally {
        await new Promise(r => setTimeout(r, 5000));
        console.log("[anvil] Stopping anvil (flushing RPC cache to disk)...");
        await stopAnvil(anvil);
      }
    }

    const systemCachePath = anvilCachePath(chainId, block);
    if (!existsSync(systemCachePath)) {
      throw new Error(`Anvil RPC cache not found at ${systemCachePath}`);
    }
    const flushed = readFileSync(systemCachePath);
    const cache =
      flushed.subarray(0, 4).toString("hex") === ZSTD_MAGIC
        ? execFileSync("zstd", ["-d", "-c", systemCachePath], {
            maxBuffer: 2 ** 31,
          })
        : flushed;
    const fixturePath = resolve(
      FIXTURES_DIR,
      `Mainnet-${block}-rpc-cache.json`,
    );
    writeFileSync(fixturePath, cache);
    console.log(
      `[write] ${fixturePath} (${(statSync(fixturePath).size / 1024 / 1024).toFixed(1)} MB)`,
    );
  }
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
