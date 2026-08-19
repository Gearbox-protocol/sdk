import { existsSync } from "node:fs";
import { resolve } from "node:path";
import {
  type Chain,
  createWalletClient,
  type Hex,
  http,
  type Transport,
  type WalletClient,
} from "viem";
import { type PrivateKeyAccount, privateKeyToAccount } from "viem/accounts";
import { afterAll, beforeAll, beforeEach } from "vitest";
import {
  type AnvilClient,
  createAnvilClient,
} from "../dev/createAnvilClient.js";
import { chains, type NetworkType, type OnchainSDK } from "../sdk/index.js";
import { type AnvilInstance, startAnvil, stopAnvil } from "./anvil.js";
import { ANVIL_PORT, ANVIL_URL } from "./constants.js";
import { FORK_PROXY_PORT, type ForkProxy, startForkProxy } from "./forkProxy.js";
import {
  ORACLE_PROXY_PORT,
  type OracleProxy,
  startOracleProxy,
} from "./oracleProxy.js";

export { REDSTONE_GATEWAYS } from "./oracleProxy.js";

const FIXTURES_DIR = resolve(import.meta.dirname, "fixtures");

/**
 * The upstream node, needed only for what neither fixture answers: the fork
 * proxy's cache covers a run that has been made before.
 */
function rpcUrl(forkCacheFile: string): string | undefined {
  const url = process.env.RPC_URL;
  if (!url && !existsSync(forkCacheFile)) {
    throw new Error(
      "RPC_URL environment variable is required for e2e tests.\n" +
        "Anvil needs it to fetch the state a run touches for the first time.",
    );
  }
  return url;
}

export interface UseFixtureOptions {
  network: NetworkType;
  block: bigint;
}

/**
 * Manages Anvil + oracle proxy + fork proxy as an atomic set for a describe
 * block.
 *
 * - beforeAll: starts oracle proxy in playback mode and the fork proxy over its
 *   cache, starts Anvil from the fork RPC cache fixture, takes evm_snapshot
 * - beforeEach: evm_revert + re-snapshot
 * - afterAll: evm_revert, stops Anvil, stops both proxies
 */
export function useFixture(options: UseFixtureOptions): void {
  const baseName = `${options.network}-${options.block}`;
  const cacheFile = resolve(FIXTURES_DIR, `${baseName}-rpc-cache.json`);
  const forkCacheFile = resolve(FIXTURES_DIR, `${baseName}-fork-rpc.json`);
  const httpDir = resolve(FIXTURES_DIR, `${baseName}-http`);

  let anvil: AnvilInstance;
  let proxy: OracleProxy;
  let fork: ForkProxy;
  let client: AnvilClient;
  let snapshotId: Hex;

  beforeAll(async () => {
    if (!existsSync(cacheFile)) {
      throw new Error(
        `Anvil RPC cache fixture not found: ${cacheFile}\n` +
          "Run: tsx --env-file .env scripts/generate-e2e-fixtures.ts",
      );
    }

    proxy = await startOracleProxy({
      port: ORACLE_PROXY_PORT,
      mode: "playback",
      recordingsDir: httpDir,
    });

    fork = await startForkProxy({
      port: FORK_PROXY_PORT,
      upstream: rpcUrl(forkCacheFile),
      cacheFile: forkCacheFile,
    });

    anvil = await startAnvil({
      cacheFilePath: cacheFile,
      forkUrl: fork.url,
      forkBlockNumber: options.block,
      chainId: chains[options.network].id,
      port: ANVIL_PORT,
    });

    client = createAnvilClient({ transport: http(anvil.url) });
    snapshotId = (await client.snapshot()) as Hex;
  });

  beforeEach(async () => {
    await client.revert({ id: snapshotId });
    snapshotId = (await client.snapshot()) as Hex;
  });

  afterAll(async () => {
    try {
      await client.revert({ id: snapshotId });
    } catch {
      // Anvil may already be stopping
    }
    await stopAnvil(anvil);
    await proxy.close();
    await fork.close();
  });
}

export function getAnvilWallet(
  sdk: OnchainSDK,
): WalletClient<Transport, Chain, PrivateKeyAccount> {
  // well-known private key for the first account in anvil
  const account = privateKeyToAccount(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
  );
  return createWalletClient({
    chain: sdk.client.chain,
    transport: http(ANVIL_URL, { timeout: 120_000 }),
    account,
    pollingInterval: 100,
  });
}
