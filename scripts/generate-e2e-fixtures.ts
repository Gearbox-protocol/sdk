/**
 * Generates e2e test fixtures: fork RPC cache + HTTP recordings for oracle APIs.
 *
 * Usage:
 *   tsx --env-file .env scripts/generate-e2e-fixtures.ts
 *
 * Environment:
 *   RPC_URL - Archive node RPC URL (required)
 *
 * Edit NETWORK, BLOCK, CHAIN_ID, and MARKET_CONFIGURATORS below for your scenario.
 */

import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { Address } from "viem";
import { anvilCachePath, startAnvilFork, stopAnvil } from "../src/e2e/anvil.js";
import {
  ORACLE_PROXY_PORT,
  type OracleProxy,
  PYTH_API_PROXY,
  REDSTONE_GATEWAYS,
  startOracleProxy,
} from "../src/e2e/oracleProxy.js";
import { AccountsPlugin } from "../src/plugins/accounts/AccountsPlugin.js";
import { AdaptersPlugin } from "../src/plugins/adapters/AdaptersPlugin.js";
import { ApyPlugin } from "../src/plugins/apy/index.js";
import { BotsPlugin } from "../src/plugins/bots/index.js";
import { DegenDistributorsPlugin } from "../src/plugins/degen-distributors/index.js";
import { chains, GearboxSDK, type NetworkType } from "../src/sdk/index.js";

// ─── Configuration ──────────────────────────────────────────────────────────
const NETWORK: NetworkType = "Mainnet";
const BLOCK = process.env.E2E_BLOCK
  ? BigInt(process.env.E2E_BLOCK)
  : 24_736_900n;
const SINGLE_MC = process.env.E2E_MC as Address | undefined;
const KYC_FACTORIES = process.env.E2E_KYC
  ? (process.env.E2E_KYC.split(",") as Address[])
  : undefined;
const IGNORE_UPDATABLE_PRICES = !!process.env.E2E_NO_ORACLES;
// ─────────────────────────────────────────────────────────────────────────────

const RPC_URL = process.env.RPC_URL ?? "";
if (!RPC_URL) {
  console.error("RPC_URL environment variable is required");
  process.exit(1);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = resolve(__dirname, "../src/e2e/fixtures");
const ANVIL_PORT = 8546;

async function main() {
  const chainId = chains[NETWORK].id;

  console.log(`\n=== Generating e2e fixtures ===`);
  console.log(`Network: ${NETWORK}`);
  console.log(`Block:   ${BLOCK}`);
  console.log(`Chain:   ${chainId}`);
  console.log(`RPC:     ${RPC_URL}\n`);

  if (!existsSync(FIXTURES_DIR)) {
    mkdirSync(FIXTURES_DIR, { recursive: true });
  }

  const baseName = `${NETWORK}-${BLOCK}`;
  const rpcCachePath = resolve(FIXTURES_DIR, `${baseName}-rpc-cache.json`);
  const httpDir = resolve(FIXTURES_DIR, `${baseName}-http`);

  let proxy: OracleProxy | undefined;

  proxy = await startOracleProxy({
    port: ORACLE_PROXY_PORT,
    mode: "record",
    recordingsDir: httpDir,
  });

  console.log("[anvil] Starting Anvil in fork mode...");
  const anvil = await startAnvilFork({
    forkUrl: RPC_URL,
    forkBlockNumber: BLOCK,
    port: ANVIL_PORT,
  });
  console.log(`[anvil] Anvil listening on ${anvil.url}\n`);

  try {
    console.log("[sdk] Attaching SDK...");
    const oracleOpts = {
      redstone: {
        historicTimestamp: true as const,
        gateways: REDSTONE_GATEWAYS,
      },
      pyth: {
        historicTimestamp: true as const,
        apiProxy: PYTH_API_PROXY,
      },
    };

    const mcOpts = SINGLE_MC ? { marketConfigurators: [SINGLE_MC] } : {};
    const kycOpts = KYC_FACTORIES ? { kycFactories: KYC_FACTORIES } : {};

    await GearboxSDK.attach({
      rpcURLs: [anvil.url],
      timeout: 480_000,
      blockNumber: BLOCK,
      ...(!SINGLE_MC && {
        plugins: {
          adapters: new AdaptersPlugin(true),
          bots: new BotsPlugin(true),
          degen: new DegenDistributorsPlugin(true),
          apy: new ApyPlugin(true),
          accounts: new AccountsPlugin({ includeZeroDebt: true }, true),
        },
      }),
      ...(IGNORE_UPDATABLE_PRICES && { ignoreUpdateablePrices: true }),
      logger: console,
      ...oracleOpts,
      ...mcOpts,
      ...kycOpts,
    });

    // Re-attach per individual market configurator so that oracle proxy
    // records Pyth URLs with per-MC feed subsets (tests attach one MC at a time)
    const allMCs = SINGLE_MC
      ? [SINGLE_MC]
      : (Object.keys(chains[NETWORK].defaultMarketConfigurators) as Address[]);
    for (const mc of allMCs) {
      const curator = chains[NETWORK].defaultMarketConfigurators[mc] ?? mc;
      console.log(
        `[sdk] Recording per-MC oracle fixtures for ${curator} (${mc})...`,
      );
      await GearboxSDK.attach({
        rpcURLs: [anvil.url],
        timeout: 480_000,
        blockNumber: BLOCK,
        marketConfigurators: [mc],
        ...(IGNORE_UPDATABLE_PRICES && { ignoreUpdateablePrices: true }),
        logger: console,
        ...oracleOpts,
        ...kycOpts,
      });
    }
  } finally {
    await proxy.close();
    await new Promise(resolve => setTimeout(resolve, 5000));
    console.log("[anvil] Stopping anvil (flushing RPC cache to disk)...");
    await stopAnvil(anvil);
  }

  // Anvil flushes fork RPC cache to ~/.foundry/cache/rpc/{name}/{block}/storage.json on exit.
  const systemCachePath = anvilCachePath(chainId, BLOCK);
  if (!existsSync(systemCachePath)) {
    throw new Error(
      `Anvil RPC cache not found at ${systemCachePath}.\n` +
        "Anvil may not have flushed its cache on exit, or the chain name " +
        "mapping in ANVIL_CHAIN_CACHE_NAMES needs updating.",
    );
  }

  const cacheSize = statSync(systemCachePath).size;
  console.log(
    `[cache] Fork RPC cache: ${(cacheSize / 1024 / 1024).toFixed(1)} MB`,
  );
  copyFileSync(systemCachePath, rpcCachePath);
  console.log(`[write] ${rpcCachePath}`);

  console.log("\n=== Done ===");
  console.log(`Commit fixtures: git add src/e2e/fixtures/ && git commit`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
