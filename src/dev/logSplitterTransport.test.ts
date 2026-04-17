import type { EIP1193RequestFn } from "viem";
import { HttpRequestError, numberToHex } from "viem";
import { describe, expect, it } from "vitest";

import type {
  CallRpcFn,
  EthGetLogsFilter,
  EthGetLogsResult,
  LogSplitterTransportOptions,
} from "./logSplitterTransport.js";
import {
  fetchLogsWithPagination,
  isFixedBlockRange,
  isRangeError,
  logSplitterTransport,
  parsePageSizeHint,
} from "./logSplitterTransport.js";

const RANGE_ERR = "query exceeds max block range";
const hintErr = (n: number) => `cannot request logs over more than ${n} blocks`;
const drpcHintErr = (from: number, to: number) =>
  `query exceeds max results 20000, retry with the range ${from}-${to}`;

type RangeStr = `${number}-${number}`;
type BlockNum = number;
type BlockRange = [BlockNum, BlockNum];

interface MockCallRpcResult {
  fn: CallRpcFn;
  calls: BlockRange[];
}

function createMockCallRpc(
  fails: Record<RangeStr, string | true>,
): MockCallRpcResult {
  const calls: BlockRange[] = [];
  const fn: CallRpcFn = async (from: number, to: number) => {
    calls.push([from, to]);
    const failure = fails[`${from}-${to}`];
    if (failure !== undefined) {
      throw new Error(failure === true ? RANGE_ERR : failure);
    }
    return [
      { blockNumber: numberToHex(from), logIndex: 0, data: numberToHex(from) },
    ] as unknown as EthGetLogsResult;
  };
  return { fn, calls };
}

function expectedLogs(
  calls: BlockRange[],
  fails: Record<RangeStr, string | true>,
): EthGetLogsResult {
  return calls
    .filter(([from, to]) => fails[`${from}-${to}`] === undefined)
    .map(
      ([from]) =>
        ({
          blockNumber: numberToHex(from),
          logIndex: 0,
          data: numberToHex(from),
        }) as unknown as EthGetLogsResult[number],
    );
}

describe("isFixedBlockRange", () => {
  const cases: Array<{ filter: EthGetLogsFilter; expected: boolean }> = [
    { filter: { fromBlock: "0xa", toBlock: "0xff" }, expected: true },
    { filter: { fromBlock: "0xa", toBlock: "latest" }, expected: false },
    { filter: { fromBlock: "latest", toBlock: "0xff" }, expected: false },
    { filter: { blockHash: "0xabc" }, expected: false },
    { filter: { toBlock: "0xff" }, expected: false },
    { filter: { fromBlock: "0xa" }, expected: false },
    { filter: {}, expected: false },
  ];

  it.each(cases)("returns $expected for $filter", ({ filter, expected }) => {
    expect(isFixedBlockRange(filter)).toBe(expected);
  });
});

describe("isRangeError", () => {
  const positive = [
    "query exceeds max block range",
    "too many results in query",
    "log response size exceeded",
    "result window is too large",
    "exceeds allowed block range",
    "cannot request logs over more than 500 blocks",
    "eth_getLogs is limited to a 10000 block range",
    "eth_getLogs requests with up to a 2000 block range",
    "range is too large",
    "exceeded max allowed range",
    "response size is too large",
    "query exceeds max results 20000, retry with the range 19515507-19515513",
  ];

  const negative = [
    "rate limit exceeded",
    "request timed out",
    "header not found",
    "execution reverted",
    "nonce too low",
  ];

  it.each(positive)('returns true for "%s"', msg => {
    expect(isRangeError(new Error(msg))).toBe(true);
  });

  it.each(negative)('returns false for "%s"', msg => {
    expect(isRangeError(new Error(msg))).toBe(false);
  });
});

describe("parsePageSizeHint", () => {
  const cases: Array<{
    name: string;
    error: unknown;
    expected: number | null;
  }> = [
    {
      name: "generic N blocks hint",
      error: new Error("cannot request logs over more than 500 blocks"),
      expected: 500,
    },
    {
      name: "block range hint",
      error: new Error("eth_getLogs is limited to a 10000 block range"),
      expected: 10000,
    },
    {
      name: "Alchemy suggested range",
      error: new HttpRequestError({
        url: "https://eth-mainnet.g.alchemy.com",
        details:
          '{"code":-32600,"message":"You can make eth_getLogs requests with up to a 10000 block range. Based on your parameters, this block range should work: [0x100, 0x1ff]"}',
      }),
      expected: 256,
    },
    {
      name: "DRPC suggested range",
      error: new Error(
        "query exceeds max results 20000, retry with the range 19515507-19515513",
      ),
      expected: 7,
    },
    {
      name: "no hint in range error",
      error: new Error("too many results"),
      expected: null,
    },
    {
      name: "unrelated error",
      error: new Error("execution reverted"),
      expected: null,
    },
  ];

  it.each(cases)("$name -> $expected", ({ error, expected }) => {
    expect(parsePageSizeHint(error)).toBe(expected);
  });
});

describe("fetchLogsWithPagination", () => {
  type SuccessCase = {
    name: string;
    from: number;
    to: number;
    options?: LogSplitterTransportOptions;
    fails: Record<RangeStr, string | true>;
    calls: BlockRange[];
  };

  const successCases: SuccessCase[] = [
    {
      name: "no limits, succeeds",
      from: 0,
      to: 99,
      fails: {},
      calls: [[0, 99]],
    },
    {
      name: "hardLimit pages",
      from: 0,
      to: 99,
      options: { hardLimit: 50 },
      fails: {},
      calls: [
        [0, 49],
        [50, 99],
      ],
    },
    {
      name: "softLimit, full range ok",
      from: 0,
      to: 99,
      options: { softLimit: 50 },
      fails: {},
      calls: [[0, 99]],
    },
    {
      name: "bisect once",
      from: 0,
      to: 99,
      fails: { "0-99": true },
      calls: [
        [0, 99],
        [0, 49],
        [50, 99],
      ],
    },
    {
      name: "hint from error",
      from: 0,
      to: 99,
      fails: { "0-99": hintErr(30) },
      calls: [
        [0, 99],
        [0, 29],
        [30, 59],
        [60, 89],
        [90, 99],
      ],
    },
    {
      name: "DRPC range hint",
      from: 100,
      to: 119,
      fails: { "100-119": drpcHintErr(100, 104) },
      calls: [
        [100, 119],
        [100, 104],
        [105, 109],
        [110, 114],
        [115, 119],
      ],
    },
    {
      name: "bisect twice",
      from: 0,
      to: 99,
      fails: { "0-99": true, "0-49": true },
      calls: [
        [0, 99],
        [0, 49],
        [0, 24],
        [25, 49],
        [50, 74],
        [75, 99],
      ],
    },
    {
      name: "softLimit caps bisection",
      from: 0,
      to: 199,
      options: { softLimit: 40 },
      fails: { "0-199": true },
      calls: [
        [0, 199],
        [0, 39],
        [40, 79],
        [80, 119],
        [120, 159],
        [160, 199],
      ],
    },
    {
      name: "softLimit, hint overrides",
      from: 0,
      to: 99,
      options: { softLimit: 50 },
      fails: { "0-99": hintErr(30) },
      calls: [
        [0, 99],
        [0, 29],
        [30, 59],
        [60, 89],
        [90, 99],
      ],
    },
    {
      name: "softLimit, bisect below",
      from: 0,
      to: 9,
      options: { softLimit: 4 },
      fails: { "0-9": true, "0-3": true },
      calls: [
        [0, 9],
        [0, 3],
        [0, 1],
        [2, 3],
        [4, 5],
        [6, 7],
        [8, 9],
      ],
    },
    {
      name: "hardLimit, page fails",
      from: 0,
      to: 99,
      options: { hardLimit: 50 },
      fails: { "0-49": true },
      calls: [
        [0, 49],
        [0, 24],
        [25, 49],
        [50, 74],
        [75, 99],
      ],
    },
    {
      name: "both limits",
      from: 0,
      to: 19,
      options: { hardLimit: 10, softLimit: 3 },
      fails: { "0-9": true },
      calls: [
        [0, 9],
        [0, 2],
        [3, 5],
        [6, 8],
        [9, 11],
        [12, 14],
        [15, 17],
        [18, 19],
      ],
    },
  ];

  it.each(successCases)("$name", async ({
    from,
    to,
    options,
    fails,
    calls,
  }) => {
    const mock = createMockCallRpc(fails);
    const result = await fetchLogsWithPagination(mock.fn, from, to, options);
    expect(mock.calls).toEqual(calls);
    expect(result).toEqual(expectedLogs(calls, fails));
  });

  it("throws InvalidParamsRpcError when from > to", async () => {
    const mock = createMockCallRpc({});
    await expect(fetchLogsWithPagination(mock.fn, 10, 5)).rejects.toThrow(
      "Invalid parameters",
    );
    expect(mock.calls).toEqual([]);
  });

  it("rethrows range error on single block", async () => {
    const mock = createMockCallRpc({ "5-5": true });
    await expect(fetchLogsWithPagination(mock.fn, 5, 5)).rejects.toThrow(
      RANGE_ERR,
    );
  });

  it("rethrows non-range error immediately", async () => {
    const mock = createMockCallRpc({ "0-99": "nonce too low" });
    await expect(fetchLogsWithPagination(mock.fn, 0, 99)).rejects.toThrow(
      "nonce too low",
    );
    expect(mock.calls).toEqual([[0, 99]]);
  });
});

describe("logSplitterTransport", () => {
  function createMockTransport(
    handler: (args: { method: string; params?: unknown[] }) => unknown,
  ) {
    return ((_opts: unknown) => ({
      config: { key: "mock", name: "Mock", type: "mock" },
      request: handler,
      value: undefined,
    })) as unknown as ReturnType<typeof logSplitterTransport>;
  }

  function getRequest(
    underlying: ReturnType<typeof createMockTransport>,
    options?: LogSplitterTransportOptions,
  ): EIP1193RequestFn {
    const transport = logSplitterTransport(underlying, options);
    const instance = transport({
      chain: null,
      retryCount: 0,
      timeout: 30_000,
    } as never);
    return instance.request as unknown as EIP1193RequestFn;
  }

  it("passes through non-eth_getLogs methods", async () => {
    const handler = () => "0x64";
    const request = getRequest(createMockTransport(handler));
    const result = await request({
      method: "eth_blockNumber",
      params: [],
    } as never);
    expect(result).toBe("0x64");
  });

  it("passes through eth_getLogs with blockHash", async () => {
    const logs = [{ blockNumber: "0x1" }];
    const handler = () => logs;
    const request = getRequest(createMockTransport(handler));
    const result = await request({
      method: "eth_getLogs",
      params: [{ blockHash: "0xabc", topics: [] }],
    } as never);
    expect(result).toBe(logs);
  });

  it("passes through eth_getLogs with tag toBlock", async () => {
    const logs = [{ blockNumber: "0x1" }];
    const handler = () => logs;
    const request = getRequest(createMockTransport(handler));
    const result = await request({
      method: "eth_getLogs",
      params: [{ fromBlock: "0x0", toBlock: "latest" }],
    } as never);
    expect(result).toBe(logs);
  });

  it("routes eth_getLogs with fixed hex range through pagination", async () => {
    const calls: unknown[] = [];
    const handler = (args: { method: string; params?: unknown[] }) => {
      calls.push(args);
      return [{ blockNumber: "0x0", logIndex: 0 }];
    };
    const request = getRequest(createMockTransport(handler), { hardLimit: 50 });
    const result = await request({
      method: "eth_getLogs",
      params: [{ fromBlock: "0x0", toBlock: "0x63" }],
    } as never);
    expect(Array.isArray(result)).toBe(true);
    expect(calls.length).toBeGreaterThan(1);
  });
});
