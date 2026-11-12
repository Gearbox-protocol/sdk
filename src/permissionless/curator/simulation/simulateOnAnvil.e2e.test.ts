import { type ChildProcess, spawn } from "node:child_process";
import { type AddressInfo, createServer } from "node:net";
import type { Address, Hex } from "viem";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { CuratorSession } from "../session/CuratorSession.js";
import {
  CONFIGURATOR,
  configuratorState,
  TIMELOCK,
  USDC,
} from "../testing/sdkHarness.js";
import type { GipSimulationTarget } from "./GipSimulationError.js";
import { simulateOnAnvil } from "./simulateOnAnvil.js";

const ANVIL = process.env.ANVIL_BIN ?? "anvil";
const TARGET: Address = "0x00000000000000000000000000000000000000aa";

/**
 * The runner's targets as these tests pass them: without a source block hash,
 * which the runner reports as a caveat rather than rejecting.
 **/
type TargetWithoutHash = Omit<GipSimulationTarget, "sourceBlockHash">;
const anvilTarget = (target: TargetWithoutHash): GipSimulationTarget =>
  target as GipSimulationTarget;

/** Runtime that returns `word` for every call: PUSH32 word; MSTORE; RETURN 32. **/
function constantReturnCode(word: Hex): Hex {
  return `0x7f${word.slice(2)}60005260206000f3`;
}

function pad32(address: Address): Hex {
  return `0x${address.slice(2).toLowerCase().padStart(64, "0")}`;
}

async function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as AddressInfo;
      server.close(() => resolve(port));
    });
  });
}

async function rpc<T = unknown>(
  url: string,
  method: string,
  params: unknown[] = [],
): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  const body = (await response.json()) as { result?: T; error?: unknown };
  if (body.error) throw new Error(`${method}: ${JSON.stringify(body.error)}`);
  return body.result as T;
}

async function anvilAvailable(): Promise<boolean> {
  return new Promise(resolve => {
    const child = spawn(ANVIL, ["--version"], { stdio: "ignore" });
    child.on("error", () => resolve(false));
    child.on("exit", code => resolve(code === 0));
  });
}

const hasAnvil = await anvilAvailable();

describe.skipIf(!hasAnvil)("anvil simulation against a live node", () => {
  let child: ChildProcess | undefined;
  let url: string;

  beforeAll(async () => {
    const port = await freePort();
    url = `http://127.0.0.1:${port}`;
    // A bare node with mainnet's chain id: no upstream fork, so no RPC URL or
    // secret is needed. Source-block verification therefore cannot confirm the
    // plan's block, which is part of what this test asserts.
    child = spawn(ANVIL, [
      "--port",
      String(port),
      "--chain-id",
      "1",
      "--silent",
    ]);
    for (let attempt = 0; attempt < 100; attempt += 1) {
      try {
        await rpc(url, "eth_chainId");
        break;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    await rpc(url, "anvil_setCode", [
      CONFIGURATOR,
      constantReturnCode(pad32(TIMELOCK)),
    ]);
    await rpc(url, "anvil_setCode", [TARGET, "0x600160005260206000f3"]);
  }, 60_000);

  afterAll(() => {
    child?.kill();
  });

  it("executes a payload, reports setup, and reverts the node afterwards", async () => {
    const blockBefore = await rpc(url, "eth_blockNumber");
    const timelockBalanceBefore = await rpc(url, "eth_getBalance", [
      TIMELOCK,
      "latest",
    ]);

    const result = await simulateOnAnvil(
      { rpcUrl: url },
      anvilTarget({
        chainId: 1,
        marketConfigurator: CONFIGURATOR,
        sourceBlockNumber: 21_000_000n,
        calls: [{ to: TARGET, callData: "0x12345678", value: "0" }],
      }),
    );

    expect(result.receipts).toHaveLength(1);
    expect(result.receipts[0].status).toBe("success");
    expect(result.receipts[0].blockTimestamp).toBeGreaterThan(0);
    // Real gas from the node's own receipt, unlike the plan's heuristic table.
    expect(typeof result.receipts[0].gasUsed).toBe("bigint");
    expect(result.receipts[0].gasUsed).toBeGreaterThan(20_000n);
    // Nothing was projected for this synthetic payload, so a successful run is
    // `incomplete` rather than `match`.
    expect(result.verdict).toBe("incomplete");
    expect(result.incompleteReasons?.join(" ")).toMatch(
      /not forking an upstream chain/,
    );
    expect(result.setupChanges.join("\n")).toMatch(/impersonating TimeLock/);
    expect(result.failures).toEqual([]);

    // Isolation: the snapshot revert undid the funding and the executed block.
    expect(await rpc(url, "eth_getBalance", [TIMELOCK, "latest"])).toBe(
      timelockBalanceBefore,
    );
    expect(await rpc(url, "eth_blockNumber")).toBe(blockBefore);
    // And the configurator's code is untouched.
    expect(await rpc(url, "eth_getCode", [CONFIGURATOR, "latest"])).toBe(
      constantReturnCode(pad32(TIMELOCK)),
    );
  }, 120_000);

  it("keeps the executed state when isolation is disabled", async () => {
    const blockBefore = BigInt(await rpc<Hex>(url, "eth_blockNumber"));
    const result = await simulateOnAnvil(
      { rpcUrl: url, isolation: "none" },
      anvilTarget({
        chainId: 1,
        marketConfigurator: CONFIGURATOR,
        sourceBlockNumber: 21_000_000n,
        calls: [{ to: TARGET, callData: "0x12345678", value: "0" }],
      }),
    );
    expect(result.receipts[0].status).toBe("success");
    expect(BigInt(await rpc<Hex>(url, "eth_blockNumber"))).toBeGreaterThan(
      blockBefore,
    );
  }, 120_000);

  it("uses the creation-time fork for default SDK simulation and restores it", async () => {
    const sdk = await CuratorSession.create({
      fork: { rpcUrl: url },
      marketConfigurator: CONFIGURATOR,
    });
    const blockBefore = await rpc(url, "eth_blockNumber");
    const result = await sdk
      .configurator({ initialState: configuratorState() })
      .addAction({
        type: "CONFIGURATOR::setEmergencyAdmin",
        params: { emergencyAdmin: USDC },
      })
      .simulate();
    expect(sdk.mode).toBe("fork");
    expect(result.receipts[0].status).toBe("success");
    expect(result.receipts[0].gasUsed).toBeGreaterThan(20_000n);
    // The synthetic configurator does not implement state reads; this verifies
    // transport, the SDK's own node and real isolation, not a state match.
    expect(result.verdict).toBe("incomplete");
    expect(result.executionError).toBeUndefined();
    expect(await rpc(url, "eth_blockNumber")).toBe(blockBefore);
    expect(result.setupChanges.join("\n")).toMatch(/restored the node/);
  }, 120_000);

  it("refuses simulation after the configured fork advances", async () => {
    const snapshot = await rpc(url, "evm_snapshot");
    try {
      const sdk = await CuratorSession.create({
        fork: { rpcUrl: url },
        marketConfigurator: CONFIGURATOR,
      });
      await rpc(url, "evm_mine");
      const block = await rpc(url, "eth_blockNumber");
      await expect(
        sdk
          .configurator({ initialState: configuratorState() })
          .addAction({
            type: "CONFIGURATOR::setEmergencyAdmin",
            params: { emergencyAdmin: USDC },
          })
          .simulate(),
      ).rejects.toThrow(/fork changed since SDK creation/);
      expect(await rpc(url, "eth_blockNumber")).toBe(block);
    } finally {
      expect(await rpc(url, "evm_revert", [snapshot])).toBe(true);
    }
  }, 120_000);

  it("refuses a node on the wrong chain", async () => {
    await expect(
      simulateOnAnvil(
        { rpcUrl: url },
        anvilTarget({
          chainId: 10,
          marketConfigurator: CONFIGURATOR,
          sourceBlockNumber: 1n,
          calls: [{ to: TARGET, callData: "0x12345678", value: "0" }],
        }),
      ),
    ).rejects.toThrow(/does not match the GIP chain/);
  }, 60_000);
});
