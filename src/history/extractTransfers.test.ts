import { readFileSync } from "node:fs";
import path from "node:path";
import type { AbiEventParameter } from "abitype";
import type {
  Abi,
  AbiEvent,
  Address,
  ContractEventArgsFromTopics,
  ContractEventName,
  Log,
} from "viem";
import {
  encodeAbiParameters,
  encodeEventTopics,
  getAbiItem,
  getAddress,
  padHex,
} from "viem";
import { describe, expect, it } from "vitest";
import { iCreditFacadeV310Abi } from "../abi/310/generated.js";
import { ierc20Abi } from "../abi/iERC20.js";
import { AddressMap } from "../sdk/index.js";
import { extractTransfers } from "./extractTransfers.js";

const FIXTURES_DIR = path.resolve(__dirname, "__fixtures__");
const INPUTS_DIR = path.join(FIXTURES_DIR, "inputs");

const addr = (hex: string) => getAddress(padHex(hex as Address, { size: 20 }));
const FACADE = addr("0xFA");
const POOL = addr("0xF0");
const CA1 = addr("0xCA");
const CA2 = addr("0xCB");
const TOKEN_A = addr("0xA1");
const TOKEN_B = addr("0xB2");
const SOMEONE = addr("0x55");
const LIQUIDATOR = addr("0x77");
const ADAPTER = addr("0x99");
const PHANTOM = addr("0xF0");
const DEPOSITED = addr("0xF1");
const PHANTOM_TARGET = addr("0xF2");

function mockLog<
  const abi extends Abi | readonly unknown[],
  eventName extends ContractEventName<abi>,
>(
  abi: abi,
  eventName: eventName,
  args: ContractEventArgsFromTopics<abi, eventName>,
  address: Address,
  logIndex: number,
): Log<bigint | number, number, false> {
  const abiItem = getAbiItem({ abi, name: eventName } as any) as AbiEvent;
  const topics = encodeEventTopics({
    abi,
    eventName,
    args,
  } as any) as Log["topics"];
  const nonIndexed = abiItem.inputs.filter(i => !i.indexed);
  const data =
    nonIndexed.length > 0
      ? encodeAbiParameters(
          nonIndexed as AbiEventParameter[],
          nonIndexed.map(i => args[i.name as keyof typeof args]),
        )
      : "0x";
  return {
    address,
    blockHash: "0x0",
    blockNumber: 1n,
    logIndex,
    transactionHash: "0x0",
    transactionIndex: 0,
    removed: false,
    topics,
    data,
  };
}

function facadeLog<
  eventName extends ContractEventName<typeof iCreditFacadeV310Abi>,
>(
  eventName: eventName,
  args: ContractEventArgsFromTopics<typeof iCreditFacadeV310Abi, eventName>,
  logIndex: number,
): Log<bigint | number, number, false> {
  return mockLog(iCreditFacadeV310Abi, eventName, args, FACADE, logIndex);
}

function transferLog(
  token: Address,
  from: Address,
  to: Address,
  value: bigint,
  logIndex: number,
): Log<bigint | number, number, false> {
  return mockLog(ierc20Abi, "Transfer", { from, to, value }, token, logIndex);
}

// Concise factories -- each call fits on one line
let idx = 0;
function mockLogs(
  fn: () => Log<bigint | number, number, false>[],
): Log<bigint | number, number, false>[] {
  idx = 0;
  return fn();
}
function startMultiCall(
  ca: Address = CA1,
): Log<bigint | number, number, false> {
  return facadeLog(
    "StartMultiCall",
    { creditAccount: ca, caller: SOMEONE },
    idx++,
  );
}
function finishMultiCall(): Log<bigint | number, number, false> {
  return facadeLog("FinishMultiCall", {} as any, idx++);
}
function execute(ca: Address = CA1): Log<bigint | number, number, false> {
  return facadeLog(
    "Execute",
    { creditAccount: ca, targetContract: ADAPTER },
    idx++,
  );
}
function addCollateral(ca: Address = CA1): Log<bigint | number, number, false> {
  return facadeLog(
    "AddCollateral",
    { creditAccount: ca, token: TOKEN_A, amount: 0n },
    idx++,
  );
}
function partiallyLiquidate(
  ca: Address = CA1,
): Log<bigint | number, number, false> {
  return facadeLog(
    "PartiallyLiquidateCreditAccount",
    {
      creditAccount: ca,
      token: TOKEN_A,
      liquidator: LIQUIDATOR,
      repaidDebt: 0n,
      seizedCollateral: 0n,
      fee: 0n,
    },
    idx++,
  );
}
function withdrawPhantomToken(
  ca: Address = CA1,
  token: Address = PHANTOM,
  amount = 0n,
): Log<bigint | number, number, false> {
  return facadeLog(
    "WithdrawPhantomToken",
    { creditAccount: ca, token, amount },
    idx++,
  );
}
function transfer(
  from: Address,
  to: Address,
  value: bigint,
  token: Address,
): Log<bigint | number, number, false> {
  return transferLog(token, from, to, value, idx++);
}

describe("mocked events", () => {
  describe("execute results", () => {
    it("single Execute in multicall", () => {
      const logs = mockLogs(() => [
        startMultiCall(),
        transfer(CA1, SOMEONE, 100n, TOKEN_A),
        execute(),
        finishMultiCall(),
      ]);
      expect(extractTransfers(logs, CA1, POOL, FACADE)).toEqual({
        executeResults: [
          {
            transfers: [
              { token: TOKEN_A, amount: 100n, from: CA1, to: SOMEONE },
            ],
            targetContract: ADAPTER,
          },
        ],
        directTransfers: [],
        phantomTokens: new AddressMap(),
      });
    });

    it("two Executes with correctly partitioned transfers", () => {
      const logs = mockLogs(() => [
        startMultiCall(),
        transfer(CA1, SOMEONE, 100n, TOKEN_A),
        transfer(SOMEONE, CA1, 200n, TOKEN_B),
        execute(),
        transfer(CA1, SOMEONE, 50n, TOKEN_A),
        execute(),
        finishMultiCall(),
      ]);
      expect(extractTransfers(logs, CA1, POOL, FACADE)).toEqual({
        executeResults: [
          {
            transfers: [
              { token: TOKEN_A, amount: 100n, from: CA1, to: SOMEONE },
              { token: TOKEN_B, amount: 200n, from: SOMEONE, to: CA1 },
            ],
            targetContract: ADAPTER,
          },
          {
            transfers: [
              { token: TOKEN_A, amount: 50n, from: CA1, to: SOMEONE },
            ],
            targetContract: ADAPTER,
          },
        ],
        directTransfers: [],
        phantomTokens: new AddressMap(),
      });
    });

    it("facade event resets accumulator", () => {
      const logs = mockLogs(() => [
        startMultiCall(),
        transfer(SOMEONE, CA1, 100n, TOKEN_B),
        addCollateral(),
        transfer(CA1, SOMEONE, 50n, TOKEN_A),
        execute(),
        finishMultiCall(),
      ]);
      expect(extractTransfers(logs, CA1, POOL, FACADE)).toEqual({
        executeResults: [
          {
            transfers: [
              { token: TOKEN_A, amount: 50n, from: CA1, to: SOMEONE },
            ],
            targetContract: ADAPTER,
          },
        ],
        directTransfers: [],
        phantomTokens: new AddressMap(),
      });
    });

    it("multiple multicall batches", () => {
      const logs = mockLogs(() => [
        startMultiCall(),
        transfer(CA1, SOMEONE, 10n, TOKEN_A),
        execute(),
        finishMultiCall(),
        startMultiCall(),
        transfer(SOMEONE, CA1, 20n, TOKEN_A),
        execute(),
        finishMultiCall(),
      ]);
      expect(extractTransfers(logs, CA1, POOL, FACADE)).toEqual({
        executeResults: [
          {
            transfers: [
              { token: TOKEN_A, amount: 10n, from: CA1, to: SOMEONE },
            ],
            targetContract: ADAPTER,
          },
          {
            transfers: [
              { token: TOKEN_A, amount: 20n, from: SOMEONE, to: CA1 },
            ],
            targetContract: ADAPTER,
          },
        ],
        directTransfers: [],
        phantomTokens: new AddressMap(),
      });
    });

    it("empty multicall", () => {
      const logs = mockLogs(() => [startMultiCall(), finishMultiCall()]);
      expect(extractTransfers(logs, CA1, POOL, FACADE)).toEqual({
        executeResults: [],
        directTransfers: [],
        phantomTokens: new AddressMap(),
      });
    });

    it("preserves individual transfers instead of netting", () => {
      const logs = mockLogs(() => [
        startMultiCall(),
        transfer(CA1, SOMEONE, 100n, TOKEN_A),
        transfer(SOMEONE, CA1, 30n, TOKEN_A),
        execute(),
        finishMultiCall(),
      ]);
      expect(extractTransfers(logs, CA1, POOL, FACADE)).toEqual({
        executeResults: [
          {
            transfers: [
              { token: TOKEN_A, amount: 100n, from: CA1, to: SOMEONE },
              { token: TOKEN_A, amount: 30n, from: SOMEONE, to: CA1 },
            ],
            targetContract: ADAPTER,
          },
        ],
        directTransfers: [],
        phantomTokens: new AddressMap(),
      });
    });
  });

  describe("direct transfers", () => {
    it("direct transfer before any facade operation", () => {
      const logs = mockLogs(() => [
        transfer(SOMEONE, CA1, 500n, TOKEN_A),
        startMultiCall(),
        execute(),
        finishMultiCall(),
      ]);
      expect(extractTransfers(logs, CA1, POOL, FACADE)).toEqual({
        executeResults: [{ transfers: [], targetContract: ADAPTER }],
        directTransfers: [{ token: TOKEN_A, from: SOMEONE, amount: 500n }],
        phantomTokens: new AddressMap(),
      });
    });

    it("direct transfer after all facade operations", () => {
      const logs = mockLogs(() => [
        startMultiCall(),
        execute(),
        finishMultiCall(),
        transfer(SOMEONE, CA1, 500n, TOKEN_A),
      ]);
      expect(extractTransfers(logs, CA1, POOL, FACADE)).toEqual({
        executeResults: [{ transfers: [], targetContract: ADAPTER }],
        directTransfers: [{ token: TOKEN_A, from: SOMEONE, amount: 500n }],
        phantomTokens: new AddressMap(),
      });
    });

    it("direct transfer between two multicall batches", () => {
      const logs = mockLogs(() => [
        startMultiCall(),
        execute(),
        finishMultiCall(),
        transfer(SOMEONE, CA1, 300n, TOKEN_A),
        startMultiCall(),
        execute(),
        finishMultiCall(),
      ]);
      expect(extractTransfers(logs, CA1, POOL, FACADE)).toEqual({
        executeResults: [
          { transfers: [], targetContract: ADAPTER },
          { transfers: [], targetContract: ADAPTER },
        ],
        directTransfers: [{ token: TOKEN_A, from: SOMEONE, amount: 300n }],
        phantomTokens: new AddressMap(),
      });
    });

    it("partial liquidation", () => {
      const logs = mockLogs(() => [
        transfer(LIQUIDATOR, CA1, 1000n, TOKEN_A),
        addCollateral(),
        partiallyLiquidate(),
      ]);
      expect(extractTransfers(logs, CA1, POOL, FACADE)).toEqual({
        executeResults: [],
        directTransfers: [],
        phantomTokens: new AddressMap(),
      });
    });

    it("outgoing transfer is never flagged as direct", () => {
      const logs = mockLogs(() => [transfer(CA1, SOMEONE, 100n, TOKEN_A)]);
      expect(extractTransfers(logs, CA1, POOL, FACADE)).toEqual({
        executeResults: [],
        directTransfers: [],
        phantomTokens: new AddressMap(),
      });
    });

    it("pool ↔ account transfers are skipped (increaseDebt / decreaseDebt)", () => {
      const logs = mockLogs(() => [
        startMultiCall(),
        transfer(POOL, CA1, 500n, TOKEN_A),
        transfer(CA1, SOMEONE, 400n, TOKEN_A),
        execute(),
        transfer(CA1, POOL, 200n, TOKEN_B),
        transfer(SOMEONE, CA1, 300n, TOKEN_B),
        execute(),
        finishMultiCall(),
      ]);
      expect(extractTransfers(logs, CA1, POOL, FACADE)).toEqual({
        executeResults: [
          {
            transfers: [
              { token: TOKEN_A, amount: 400n, from: CA1, to: SOMEONE },
            ],
            targetContract: ADAPTER,
          },
          {
            transfers: [
              { token: TOKEN_B, amount: 300n, from: SOMEONE, to: CA1 },
            ],
            targetContract: ADAPTER,
          },
        ],
        directTransfers: [],
        phantomTokens: new AddressMap(),
      });
    });

    it("pool → account transfer outside multicall is not flagged as direct", () => {
      const logs = mockLogs(() => [
        transfer(POOL, CA1, 1000n, TOKEN_A),
        startMultiCall(),
        execute(),
        finishMultiCall(),
      ]);
      expect(extractTransfers(logs, CA1, POOL, FACADE)).toEqual({
        executeResults: [{ transfers: [], targetContract: ADAPTER }],
        directTransfers: [],
        phantomTokens: new AddressMap(),
      });
    });
  });

  describe("phantom token withdrawal", () => {
    it("pops phantom Execute and records phantom token mapping", () => {
      const logs = mockLogs(() => [
        startMultiCall(),
        transfer(PHANTOM_TARGET, CA1, 100n, DEPOSITED),
        execute(),
        withdrawPhantomToken(),
        transfer(CA1, SOMEONE, 100n, DEPOSITED),
        finishMultiCall(),
      ]);
      const result = extractTransfers(logs, CA1, POOL, FACADE);
      expect(result.executeResults).toEqual([]);
      expect(result.phantomTokens).toEqual(
        new AddressMap([[PHANTOM, DEPOSITED]]),
      );
    });

    it("phantom Execute does not affect surrounding adapter Executes", () => {
      const logs = mockLogs(() => [
        startMultiCall(),
        transfer(CA1, SOMEONE, 50n, TOKEN_A),
        execute(),
        transfer(PHANTOM_TARGET, CA1, 100n, DEPOSITED),
        execute(),
        withdrawPhantomToken(),
        transfer(CA1, SOMEONE, 100n, DEPOSITED),
        transfer(CA1, SOMEONE, 30n, TOKEN_B),
        execute(),
        finishMultiCall(),
      ]);
      const result = extractTransfers(logs, CA1, POOL, FACADE);
      expect(result.executeResults).toEqual([
        {
          transfers: [{ token: TOKEN_A, amount: 50n, from: CA1, to: SOMEONE }],
          targetContract: ADAPTER,
        },
        {
          transfers: [
            { token: DEPOSITED, amount: 100n, from: CA1, to: SOMEONE },
            { token: TOKEN_B, amount: 30n, from: CA1, to: SOMEONE },
          ],
          targetContract: ADAPTER,
        },
      ]);
      expect(result.phantomTokens).toEqual(
        new AddressMap([[PHANTOM, DEPOSITED]]),
      );
    });

    it("phantom withdrawal in partial liquidation pops Execute", () => {
      const logs = mockLogs(() => [
        transfer(LIQUIDATOR, CA1, 1000n, TOKEN_A),
        addCollateral(),
        transfer(PHANTOM_TARGET, CA1, 200n, DEPOSITED),
        execute(),
        withdrawPhantomToken(),
        partiallyLiquidate(),
      ]);
      const result = extractTransfers(logs, CA1, POOL, FACADE);
      expect(result.executeResults).toEqual([]);
      expect(result.phantomTokens).toEqual(
        new AddressMap([[PHANTOM, DEPOSITED]]),
      );
    });
  });
});

describe("real events", () => {
  it("0x1b0a4a7e337c1c2cc0ef459e76337a807a57e9ecae1be81bb8ec833b554c9699_0x9d7ab1290d7a3ee662f545ac29091c4c61f81f14", () => {
    const inputJson = JSON.parse(
      readFileSync(
        path.join(
          INPUTS_DIR,
          "0x1b0a4a7e337c1c2cc0ef459e76337a807a57e9ecae1be81bb8ec833b554c9699_0x9d7ab1290d7a3ee662f545ac29091c4c61f81f14.json",
        ),
        "utf-8",
      ),
    );
    const result = extractTransfers(
      inputJson.receipt.logs,
      inputJson.creditAccount,
      inputJson.pool,
      inputJson.creditFacade,
    );
    expect(result).toMatchInlineSnapshot(
      {
        directTransfers: [],
        executeResults: [
          {
            targetContract: "0x5A71E7e04F8725fD42a216949E7099ebd08A42E3",
            transfers: [
              {
                amount: 269272994973813956812599n,
                from: "0x9D7aB1290D7a3eE662F545AC29091C4C61f81f14",
                to: "0x5A71E7e04F8725fD42a216949E7099ebd08A42E3",
                token: "0xbd5d4c539b3773086632416a4ec8cef57c945319",
              },
            ],
          },
          {
            targetContract: "0x667701e51B4D1Ca244F17C78F7aB8744B4C99F9B",
            transfers: [
              {
                amount: 239891558324n,
                from: "0x9D7aB1290D7a3eE662F545AC29091C4C61f81f14",
                to: "0x52Aa899454998Be5b000Ad077a46Bbe360F4e497",
                token: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
              },
              {
                amount: 240180870653n,
                from: "0x52Aa899454998Be5b000Ad077a46Bbe360F4e497",
                to: "0x9D7aB1290D7a3eE662F545AC29091C4C61f81f14",
                token: "0xdac17f958d2ee523a2206206994597c13d831ec7",
              },
            ],
          },
        ],
        liquidationRemainingFunds: undefined,
        phantomTokens: new AddressMap(),
      },
      `
      {
        "directTransfers": [],
        "executeResults": [
          {
            "targetContract": "0x5A71E7e04F8725fD42a216949E7099ebd08A42E3",
            "transfers": [
              {
                "amount": 269272994973813956812599n,
                "from": "0x9D7aB1290D7a3eE662F545AC29091C4C61f81f14",
                "to": "0x5A71E7e04F8725fD42a216949E7099ebd08A42E3",
                "token": "0xbd5d4c539b3773086632416a4ec8cef57c945319",
              },
            ],
          },
          {
            "targetContract": "0x667701e51B4D1Ca244F17C78F7aB8744B4C99F9B",
            "transfers": [
              {
                "amount": 239891558324n,
                "from": "0x9D7aB1290D7a3eE662F545AC29091C4C61f81f14",
                "to": "0x52Aa899454998Be5b000Ad077a46Bbe360F4e497",
                "token": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
              },
              {
                "amount": 240180870653n,
                "from": "0x52Aa899454998Be5b000Ad077a46Bbe360F4e497",
                "to": "0x9D7aB1290D7a3eE662F545AC29091C4C61f81f14",
                "token": "0xdac17f958d2ee523a2206206994597c13d831ec7",
              },
            ],
          },
        ],
        "liquidationRemainingFunds": undefined,
        "phantomTokens": {},
      }
    `,
    );
  });
});
