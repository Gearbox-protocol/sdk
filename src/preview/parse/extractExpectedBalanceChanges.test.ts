import { type Address, getAddress, padHex } from "viem";
import { describe, expect, it } from "vitest";
import type { ParsedCallV2 } from "../../sdk/index.js";
import { extractExpectedBalanceChanges } from "./extractExpectedBalanceChanges.js";

const addr = (hex: string) => getAddress(padHex(hex as Address, { size: 20 }));

const FACADE = addr("0xFA");
const ADAPTER = addr("0xAD");
const TOKEN_A = addr("0x01");
const TOKEN_B = addr("0x02");

function makeCall(
  functionName: string,
  rawArgs: Record<string, unknown> = {},
  target: Address = FACADE,
): ParsedCallV2 {
  return {
    chainId: 1,
    target,
    contractType: "TEST",
    version: 310,
    functionName,
    rawArgs,
  };
}

describe("extractExpectedBalanceChanges", () => {
  it("returns decoded deltas for a router-shaped multicall", () => {
    const innerCalls: ParsedCallV2[] = [
      makeCall("onDemandPriceUpdates((address,bytes)[])", { updates: [] }),
      makeCall("storeExpectedBalances((address,int256)[])", {
        balanceDeltas: [
          { token: TOKEN_A, amount: 1_000n },
          { token: TOKEN_B, amount: -50n },
        ],
      }),
      makeCall("swap(uint256)", { amount: 1n }, ADAPTER),
      makeCall("compareBalances()"),
    ];

    expect(extractExpectedBalanceChanges(innerCalls)).toEqual([
      { token: TOKEN_A, delta: 1_000n },
      { token: TOKEN_B, delta: -50n },
    ]);
  });
});
