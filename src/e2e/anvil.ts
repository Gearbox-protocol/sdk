import { type ChildProcess, spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Foundry uses human-readable names for well-known chains in its RPC cache path
 * (~/.foundry/cache/rpc/{name}/{block}/storage.json).
 * Unknown chains fall back to the numeric chain ID.
 * Names come from alloy's NamedChain enum (lowercased).
 *
 * @see https://github.com/alloy-rs/chains/blob/main/src/named.rs
 */
const ANVIL_CHAIN_CACHE_NAMES: Record<number, string> = {
  1: "mainnet",
  10: "optimism",
  56: "bsc",
  100: "gnosis",
  137: "polygon",
  250: "fantom",
  252: "fraxtal",
  324: "zksync",
  8453: "base",
  42161: "arbitrum",
  42170: "arbitrum-nova",
  43114: "avalanche",
  59144: "linea",
  80084: "berachain",
  80094: "berachain",
  534352: "scroll",
};

export interface AnvilInstance {
  process: ChildProcess;
  port: number;
  url: string;
  /** Directory to clean up when stopping */
  tempDir?: string;
}

export interface StartAnvilOptions {
  /** Path to compressed (.gz) or uncompressed fork RPC cache fixture (storage.json) */
  cacheFilePath: string;
  /** RPC URL for anvil to fetch uncached data (e.g. fork block header) */
  forkUrl: string;
  forkBlockNumber: number | bigint;
  chainId: number;
  port?: number;
}

export interface StartAnvilForkOptions {
  forkUrl: string;
  forkBlockNumber: number | bigint;
  chainId: number;
  port?: number;
  /** Anvil RPC request timeout in ms (default: 120000) */
  timeout?: number;
}

/**
 * Returns the directory name anvil uses for a chain's RPC cache.
 */
export function anvilCacheDirName(chainId: number): string {
  return ANVIL_CHAIN_CACHE_NAMES[chainId] ?? String(chainId);
}

/**
 * Returns the path where anvil stores fork RPC cache for a given chain/block.
 */
export function anvilCachePath(
  chainId: number,
  block: number | bigint,
): string {
  return join(
    homedir(),
    ".foundry",
    "cache",
    "rpc",
    anvilCacheDirName(chainId),
    String(block),
    "storage.json",
  );
}

/**
 * Spawns anvil with the given args and resolves once it's listening.
 */
function spawnAnvil(
  args: string[],
  port: number,
  timeoutMs: number,
  tempDir?: string,
): Promise<AnvilInstance> {
  return new Promise<AnvilInstance>((resolve, reject) => {
    const proc = spawn("anvil", args, { stdio: ["ignore", "pipe", "pipe"] });
    let settled = false;
    let stderr = "";

    const timeout = setTimeout(() => {
      if (!settled) {
        settled = true;
        proc.kill("SIGTERM");
        reject(
          new Error(
            `Anvil failed to start within ${timeoutMs / 1000}s.\nstderr: ${stderr}`,
          ),
        );
      }
    }, timeoutMs);

    proc.stdout?.on("data", (data: Buffer) => {
      const output = data.toString();
      if (!settled && output.includes("Listening on")) {
        settled = true;
        clearTimeout(timeout);
        resolve({
          process: proc,
          port,
          url: `http://127.0.0.1:${port}`,
          tempDir,
        });
      }
    });

    proc.stderr?.on("data", (data: Buffer) => {
      stderr += data.toString();
    });

    proc.on("error", err => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        reject(new Error(`Failed to spawn anvil: ${err.message}`));
      }
    });

    proc.on("exit", (code, signal) => {
      if (!settled) {
        settled = true;
        clearTimeout(timeout);
        reject(
          new Error(
            `Anvil exited before ready (code=${code}, signal=${signal}).\nstderr: ${stderr}`,
          ),
        );
      }
    });
  });
}

/**
 * Places fork RPC cache fixture at the expected location and starts anvil
 * in fork mode with pre-populated cache. Used by tests.
 *
 * Anvil caches fork RPC data at ~/.foundry/cache/rpc/{name}/{block}/storage.json.
 * The pre-populated cache handles virtually all RPC calls; the forkUrl is only
 * needed for the initial block header fetch that anvil performs on startup.
 */
export function startAnvil(options: StartAnvilOptions): Promise<AnvilInstance> {
  const {
    cacheFilePath,
    forkUrl,
    forkBlockNumber,
    chainId,
    port = 8545,
  } = options;

  if (!existsSync(cacheFilePath)) {
    throw new Error(
      `Anvil RPC cache fixture not found: ${cacheFilePath}\n` +
        "Run: tsx --env-file .env scripts/generate-e2e-fixtures.ts",
    );
  }

  const cacheDest = anvilCachePath(chainId, forkBlockNumber);
  mkdirSync(join(cacheDest, ".."), { recursive: true });

  writeFileSync(cacheDest, readFileSync(cacheFilePath));

  return spawnAnvil(
    [
      "--fork-url",
      forkUrl,
      "--fork-block-number",
      String(forkBlockNumber),
      "--port",
      String(port),
      "--timeout",
      "120000",
    ],
    port,
    30_000,
  );
}

/**
 * Spawns anvil in fork mode. Used by the fixture generation script.
 */
export function startAnvilFork(
  options: StartAnvilForkOptions,
): Promise<AnvilInstance> {
  const {
    forkUrl,
    forkBlockNumber,
    chainId,
    port = 8546,
    timeout = 120_000,
  } = options;

  return spawnAnvil(
    [
      "--fork-url",
      forkUrl,
      "--fork-block-number",
      String(forkBlockNumber),
      "--chain-id",
      String(chainId),
      "--port",
      String(port),
      "--timeout",
      String(timeout),
    ],
    port,
    60_000,
  );
}

/**
 * Stops anvil and cleans up temp files.
 */
export async function stopAnvil(instance: AnvilInstance): Promise<void> {
  // Give anvil a moment to flush cache
  // await new Promise(r => setTimeout(r, 1000));

  const proc = instance.process;

  await new Promise<void>(resolve => {
    if (proc.exitCode !== null || proc.signalCode !== null) {
      resolve();
      return;
    }

    const forceKill = setTimeout(() => {
      proc.kill("SIGKILL");
    }, 30_000);

    proc.on("exit", () => {
      clearTimeout(forceKill);
      resolve();
    });
    proc.kill("SIGTERM");
  });

  if (instance.tempDir) {
    rmSync(instance.tempDir, { recursive: true, force: true });
  }
}
