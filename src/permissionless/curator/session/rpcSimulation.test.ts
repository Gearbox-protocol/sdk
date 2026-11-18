import { type Address, type Hex, toHex, zeroHash } from "viem";
import { describe, expect, it } from "vitest";
import { simulateOnRpc } from "../simulation/simulateOnRpc.js";
import {
  CONFIGURATOR,
  configuratorState,
  createTestSdk,
  SOURCE_BLOCK,
  SOURCE_BLOCK_HASH,
  SOURCE_TIMESTAMP,
  TIMELOCK,
  TREASURY,
  USDC,
} from "../testing/sdkHarness.js";
import { contractResult } from "../testing/startForkNode.js";

type Call = { to: Address; from?: Address; data: Hex; gas?: Hex };
interface Request {
  method: string;
  params: [
    {
      validation: boolean;
      blockStateCalls: { calls: Call[]; blockOverrides: { time: Hex } }[];
    },
    Hex,
  ];
}

async function setup(
  mode: "success" | "wrong-hash" | "revert" | "unsupported" | "read-failure",
) {
  const requests: Request[] = [];
  const { sdk } = await createTestSdk({
    stub: {
      client: {
        request: async (request: Request) => {
          requests.push(request);
          if (mode === "unsupported") throw new Error("Method not found");
          return request.params[0].blockStateCalls.map(
            ({ calls, blockOverrides }, i) => ({
              number: toHex(SOURCE_BLOCK + BigInt(i + 1)),
              timestamp: blockOverrides.time,
              parentHash: mode === "wrong-hash" ? zeroHash : SOURCE_BLOCK_HASH,
              transactions: calls.map(() => zeroHash),
              calls: calls.map((call, j) => {
                if (j === 2 && mode === "read-failure")
                  throw new Error("RPC gas cap");
                if (j === 1 && mode === "revert")
                  return {
                    status: "0x0",
                    error: { message: "reverted" },
                    gasUsed: "0x12",
                    returnData: "0x",
                  };
                return {
                  status: "0x1",
                  gasUsed: "0x20",
                  returnData: j < 2 ? "0x" : contractResult(call.to, call.data),
                };
              }),
            }),
          );
        },
      },
    },
  });
  const config = sdk
    .configurator({ initialState: configuratorState() })
    .addAction({
      type: "CONFIGURATOR::setEmergencyAdmin",
      params: { emergencyAdmin: USDC },
    })
    .addAction({
      type: "TREASURY_SPLITTER::distribute",
      params: { token: USDC },
    });
  return { config, requests, sdk };
}

describe("RPC payload simulation", () => {
  it("replays only the ordered payload from the timelock before each independent post-state read", async () => {
    const { config, requests } = await setup("success");
    const { txs } = await config.preview();
    const result = await config.simulate({
      gas: 1000000n,
      eta: SOURCE_TIMESTAMP + 30,
    });
    expect(result.receipts.map(r => r.gasUsed)).toEqual([32n, 32n]);
    // Our node returns its own emergencyAdmin, independently of the projection.
    expect(result.verdict).toBe("mismatch");
    expect(result.configurator?.observed?.emergencyAdmin).toBe(TREASURY);
    expect(requests.length).toBeGreaterThan(1);
    for (const [index, req] of requests.entries()) {
      expect(req.method).toBe("eth_simulateV1");
      expect(req.params[1]).toBe(toHex(SOURCE_BLOCK));
      const [block] = req.params[0].blockStateCalls;
      expect(block.blockOverrides.time).toBe(toHex(SOURCE_TIMESTAMP + 30));
      expect(block.calls).toHaveLength(index ? 3 : 2);
      expect(block.calls.slice(0, 2)).toEqual(
        txs.map(({ tx }) => ({
          from: TIMELOCK,
          to: tx.to,
          data: tx.callData,
          value: "0x0",
          gas: toHex(1000000n),
        })),
      );
    }
  });
  it("carries ordered batches into consecutive simulated blocks", async () => {
    const { sdk, config, requests } = await setup("success");
    const { txs } = await config.preview();
    const batches = txs.map(({ tx }) => [tx]);
    const r = await simulateOnRpc({
      client: sdk.readClient,
      sender: TIMELOCK,
      options: {},
      timestamp: SOURCE_TIMESTAMP + 1,
      batches,
      target: {
        chainId: 1,
        marketConfigurator: CONFIGURATOR,
        sourceBlockNumber: SOURCE_BLOCK,
        sourceBlockHash: SOURCE_BLOCK_HASH,
      },
    });
    expect(r.receipts.map(call => call.blockNumber)).toEqual([
      SOURCE_BLOCK + 1n,
      SOURCE_BLOCK + 2n,
    ]);
    expect(
      requests[0].params[0].blockStateCalls.map(b => b.calls.map(c => c.data)),
    ).toEqual(txs.map(({ tx }) => [tx.callData]));
  });

  it("reports the first reverted payload without reading post-state", async () => {
    const { config, requests } = await setup("revert");
    const result = await config.simulate();
    expect(result.verdict).toBe("execution_failed");
    expect(result.executionError?.index).toBe(1);
    expect(requests).toHaveLength(1);
  });
  it("keeps successful execution receipts when the RPC cannot read back state", async () => {
    const { config } = await setup("read-failure");
    const result = await config.simulate();
    expect(result.verdict).toBe("incomplete");
    expect(result.failures).toContainEqual(
      expect.objectContaining({ phase: "read", target: CONFIGURATOR }),
    );
    expect(result.receipts).toHaveLength(2);
  });
  it.each(["wrong-hash", "unsupported"] as const)(
    "rejects setup for %s",
    async mode => {
      const { config } = await setup(mode);
      await expect(config.simulate()).rejects.toMatchObject({ phase: "setup" });
    },
  );
});
