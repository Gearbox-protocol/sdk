import type {
  Address,
  ContractFunctionParameters,
  Hex,
  MulticallResponse,
} from "viem";
import {
  BaseError,
  createClient,
  custom,
  encodeFunctionData,
  encodeFunctionResult,
  parseAbi,
  zeroAddress,
} from "viem";
import { arbitrum, mainnet } from "viem/chains";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { iUpdatablePriceFeedAbi } from "../../../abi/iUpdatablePriceFeed.js";
import type { IPriceUpdateTx } from "../../types/index.js";
import {
  SimulateWithPriceUpdatesError,
  simulateWithPriceUpdates,
} from "./simulateWithPriceUpdates.js";

vi.mock("./simulateMulticall.js", () => ({
  simulateMulticall: vi.fn(),
}));

import { simulateMulticall } from "./simulateMulticall.js";

const noopTransport = custom({
  request: async () => {
    throw new Error("transport not implemented");
  },
});

function fakeClient(chain: typeof mainnet | typeof arbitrum = mainnet) {
  return createClient({ chain, transport: noopTransport });
}

function fakePassthroughClient(response: Hex) {
  return createClient({
    chain: mainnet,
    transport: custom({
      request: async ({ method }) => {
        if (method === "eth_call") return response;
        throw new Error(`unexpected method: ${method}`);
      },
    }),
  });
}

const simpleAbi = parseAbi([
  "function balanceOf(address) view returns (uint256)",
]);

function makePriceUpdateTx(
  priceFeed: Address = "0x1111111111111111111111111111111111111111",
): IPriceUpdateTx {
  const callData = encodeFunctionData({
    abi: iUpdatablePriceFeedAbi,
    functionName: "updatePrice",
    args: ["0xdeadbeef"],
  });
  return {
    raw: {
      to: priceFeed,
      callData,
      value: "0",
      signature: "updatePrice(bytes)",
      contractMethod: { inputs: [], name: "updatePrice", payable: false },
      contractInputsValues: { data: "0xdeadbeef" },
    },
    data: { priceFeed, timestamp: 1700000000 },
    pretty: `test feed at ${priceFeed}`,
    validateTimestamp: () => "valid",
  };
}

function makeUserCall(): ContractFunctionParameters {
  return {
    abi: simpleAbi,
    address: zeroAddress,
    functionName: "balanceOf",
    args: [zeroAddress],
  };
}

const ok = (result: unknown): MulticallResponse => ({
  status: "success",
  result,
});

const fail = (): MulticallResponse => ({
  status: "failure",
  error: new BaseError("call reverted"),
  result: undefined,
});

/**
 * Sets up the simulateMulticall mock.
 * The mock implementation inspects the contracts array it receives,
 * and builds a results array where the last `userResults.length` entries
 * are the provided user results, and all preceding entries (timestamp, block number, price updates)
 * are successes with sensible defaults. Individual prefix entries can be overridden
 * by index via `prefixOverrides`.
 */
function mockSimulateMulticall(
  userResults: MulticallResponse[],
  prefixOverrides: Record<number, MulticallResponse> = {},
): void {
  vi.mocked(simulateMulticall).mockImplementation((async (
    _client: unknown,
    params: { contracts: readonly unknown[] },
  ) => {
    const nContracts = params.contracts.length;
    const prefixLen = nContracts - userResults.length;
    const results: MulticallResponse[] = [];
    for (let i = 0; i < prefixLen; i++) {
      if (prefixOverrides[i]) {
        results.push(prefixOverrides[i]);
      } else {
        results.push(ok(BigInt(i)));
      }
    }
    results.push(...userResults);
    return {
      results,
      request: {
        to: mainnet.contracts.multicall3.address,
        data: "0x" as const,
      },
    };
  }) as typeof simulateMulticall);
}

beforeEach(() => {
  vi.mocked(simulateMulticall).mockReset();
});

describe("input validation", () => {
  it("throws SimulateWithPriceUpdatesError when contracts array is empty", async () => {
    await expect(
      simulateWithPriceUpdates(fakeClient(), {
        contracts: [],
        priceUpdates: [makePriceUpdateTx()],
      }),
    ).rejects.toThrow(SimulateWithPriceUpdatesError);

    expect(simulateMulticall).not.toHaveBeenCalled();
  });

  it("throws when multicallAddress is not provided and client chain is not configured", async () => {
    const bareClient = createClient({ transport: noopTransport });
    await expect(
      simulateWithPriceUpdates(bareClient, {
        contracts: [makeUserCall()],
        priceUpdates: [],
      }),
    ).rejects.toThrow();
  });
});

describe("happy path", () => {
  it("returns user contract results for single price update", async () => {
    mockSimulateMulticall([ok(100n), ok(200n)]);

    const result = await simulateWithPriceUpdates(fakeClient(), {
      contracts: [makeUserCall(), makeUserCall()],
      priceUpdates: [makePriceUpdateTx()],
    });

    expect(result).toEqual([100n, 200n]);
  });

  it("returns user contract results with zero price updates", async () => {
    mockSimulateMulticall([ok(42n), ok(43n)]);

    const result = await simulateWithPriceUpdates(fakeClient(), {
      contracts: [makeUserCall(), makeUserCall()],
      priceUpdates: [],
    });

    expect(result).toEqual([42n, 43n]);
  });

  it("returns user contract results with multiple price updates", async () => {
    mockSimulateMulticall([ok(999n)]);

    const result = await simulateWithPriceUpdates(fakeClient(), {
      contracts: [makeUserCall()],
      priceUpdates: [
        makePriceUpdateTx("0x1111111111111111111111111111111111111111"),
        makePriceUpdateTx("0x2222222222222222222222222222222222222222"),
        makePriceUpdateTx("0x3333333333333333333333333333333333333333"),
      ],
    });

    expect(result).toEqual([999n]);
  });

  it("passes blockNumber, gas, and account through to simulateMulticall", async () => {
    mockSimulateMulticall([ok(1n)]);

    await simulateWithPriceUpdates(fakeClient(arbitrum), {
      contracts: [makeUserCall()],
      priceUpdates: [makePriceUpdateTx()],
      blockNumber: 123n,
      gas: 500_000n,
      account: zeroAddress,
    });

    expect(simulateMulticall).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        blockNumber: 123n,
        gas: 500_000n,
        account: zeroAddress,
        allowFailure: true,
      }),
    );
  });
});

describe("price update failures -- non-strict (default)", () => {
  it("does not throw when price update fails and strictPrices is false", async () => {
    mockSimulateMulticall([ok(42n)], { 2: fail() });

    const result = await simulateWithPriceUpdates(fakeClient(), {
      contracts: [makeUserCall()],
      priceUpdates: [makePriceUpdateTx()],
    });

    expect(result).toEqual([42n]);
  });
});

describe("price update failures -- strict", () => {
  it("throws SimulateWithPriceUpdatesError when price update fails and strictPrices is true", async () => {
    mockSimulateMulticall([ok(42n)], { 2: fail() });

    await expect(
      simulateWithPriceUpdates(fakeClient(), {
        contracts: [makeUserCall()],
        priceUpdates: [makePriceUpdateTx()],
        strictPrices: true,
      }),
    ).rejects.toThrow(SimulateWithPriceUpdatesError);
  });
});

describe("user call failures", () => {
  it("throws SimulateWithPriceUpdatesError when a user call fails", async () => {
    mockSimulateMulticall([ok(1n), fail()]);

    await expect(
      simulateWithPriceUpdates(fakeClient(), {
        contracts: [makeUserCall(), makeUserCall()],
        priceUpdates: [makePriceUpdateTx()],
      }),
    ).rejects.toThrow(SimulateWithPriceUpdatesError);
  });
});

describe("block number check", () => {
  it("throws on block number mismatch on mainnet", async () => {
    mockSimulateMulticall([ok(1n), ok(2n)], { 1: ok(999n) });

    await expect(
      simulateWithPriceUpdates(fakeClient(mainnet), {
        contracts: [makeUserCall(), makeUserCall()],
        priceUpdates: [],
        blockNumber: 100n,
      }),
    ).rejects.toThrow(SimulateWithPriceUpdatesError);
  });

  it("does not check block number on non-mainnet chains", async () => {
    mockSimulateMulticall([ok(1n), ok(2n)], { 1: ok(999n) });

    const result = await simulateWithPriceUpdates(fakeClient(arbitrum), {
      contracts: [makeUserCall(), makeUserCall()],
      priceUpdates: [],
      blockNumber: 100n,
    });

    expect(result).toEqual([1n, 2n]);
  });

  it("throws on block number mismatch on non-mainnet when forceBlockNumberCheck is true", async () => {
    mockSimulateMulticall([ok(1n), ok(2n)], { 1: ok(999n) });

    await expect(
      simulateWithPriceUpdates(fakeClient(arbitrum), {
        contracts: [makeUserCall(), makeUserCall()],
        priceUpdates: [],
        blockNumber: 100n,
        forceBlockNumberCheck: true,
      }),
    ).rejects.toThrow(SimulateWithPriceUpdatesError);
  });

  it("does not check block number when blockNumber parameter is not provided", async () => {
    mockSimulateMulticall([ok(1n), ok(2n)], { 1: ok(999n) });

    const result = await simulateWithPriceUpdates(fakeClient(mainnet), {
      contracts: [makeUserCall(), makeUserCall()],
      priceUpdates: [],
    });

    expect(result).toEqual([1n, 2n]);
  });
});

describe("simulateMulticall throws", () => {
  it("wraps unknown error from simulateMulticall into SimulateWithPriceUpdatesError", async () => {
    vi.mocked(simulateMulticall).mockRejectedValue(
      new Error("network failure"),
    );

    await expect(
      simulateWithPriceUpdates(fakeClient(), {
        contracts: [makeUserCall()],
        priceUpdates: [makePriceUpdateTx()],
      }),
    ).rejects.toThrow(SimulateWithPriceUpdatesError);
  });

  it("re-throws SimulateWithPriceUpdatesError as-is", async () => {
    const original = new SimulateWithPriceUpdatesError(undefined, {
      priceUpdates: [],
      calls: [],
    });
    vi.mocked(simulateMulticall).mockRejectedValue(original);

    await expect(
      simulateWithPriceUpdates(fakeClient(), {
        contracts: [makeUserCall()],
        priceUpdates: [makePriceUpdateTx()],
      }),
    ).rejects.toBe(original);
  });
});

describe("pass-through (single call, no price updates)", () => {
  it("executes single call directly without simulateMulticall", async () => {
    const encoded = encodeFunctionResult({
      abi: simpleAbi,
      functionName: "balanceOf",
      result: 42n,
    });
    const client = fakePassthroughClient(encoded);

    const result = await simulateWithPriceUpdates(client, {
      contracts: [makeUserCall()],
      priceUpdates: [],
    });

    expect(result).toEqual([42n]);
    expect(simulateMulticall).not.toHaveBeenCalled();
  });

  it("wraps transport errors in SimulateWithPriceUpdatesError", async () => {
    const client = createClient({
      chain: mainnet,
      transport: custom(
        {
          request: async () => {
            throw new Error("rpc failure");
          },
        },
        { retryCount: 0 },
      ),
    });

    await expect(
      simulateWithPriceUpdates(client, {
        contracts: [makeUserCall()],
        priceUpdates: [],
      }),
    ).rejects.toThrow(SimulateWithPriceUpdatesError);

    expect(simulateMulticall).not.toHaveBeenCalled();
  });

  it("still uses multicall when there are price updates even with one user call", async () => {
    mockSimulateMulticall([ok(42n)]);

    await simulateWithPriceUpdates(fakeClient(), {
      contracts: [makeUserCall()],
      priceUpdates: [makePriceUpdateTx()],
    });

    expect(simulateMulticall).toHaveBeenCalled();
  });

  it("still uses multicall when there are multiple user calls and no price updates", async () => {
    mockSimulateMulticall([ok(1n), ok(2n)]);

    await simulateWithPriceUpdates(fakeClient(), {
      contracts: [makeUserCall(), makeUserCall()],
      priceUpdates: [],
    });

    expect(simulateMulticall).toHaveBeenCalled();
  });
});
