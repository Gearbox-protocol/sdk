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

const storeCall = makeCall("storeExpectedBalances((address,int256)[])", {
  balanceDeltas: [
    { token: TOKEN_A, amount: 1_000n },
    { token: TOKEN_B, amount: -50n },
  ],
});
const compareCall = makeCall("compareBalances()");

const EXPECTED_DELTAS = [
  { token: TOKEN_A, balance: 1_000n },
  { token: TOKEN_B, balance: -50n },
];

describe("extractExpectedBalanceChanges", () => {
  it("returns decoded deltas and bracket indices for a router-shaped multicall", () => {
    const innerCalls: ParsedCallV2[] = [
      makeCall("onDemandPriceUpdates((address,bytes)[])", { updates: [] }),
      storeCall,
      makeCall("swap(uint256)", { amount: 1n }, ADAPTER),
      compareCall,
    ];

    expect(extractExpectedBalanceChanges(innerCalls)).toEqual({
      deltas: EXPECTED_DELTAS,
      startIndex: 1,
      endIndex: 3,
    });
  });

  it("returns decoded deltas and bracket indices when the pair sits mid-multicall", () => {
    const innerCalls: ParsedCallV2[] = [
      makeCall("increaseDebt(uint256)", { amount: 100n }),
      makeCall("addCollateral(address,uint256)", {
        token: TOKEN_A,
        amount: 10n,
      }),
      storeCall,
      makeCall("swap(uint256)", { amount: 1n }, ADAPTER),
      compareCall,
      makeCall("updateQuota(address,int96,uint96)", {
        token: TOKEN_B,
        quotaChange: 5n,
        minQuota: 0n,
      }),
    ];

    expect(extractExpectedBalanceChanges(innerCalls)).toEqual({
      deltas: EXPECTED_DELTAS,
      startIndex: 2,
      endIndex: 4,
    });
  });

  it("returns undefined when no pair is present", () => {
    const innerCalls: ParsedCallV2[] = [
      makeCall("increaseDebt(uint256)", { amount: 100n }),
      makeCall("addCollateral(address,uint256)", {
        token: TOKEN_A,
        amount: 10n,
      }),
    ];

    expect(extractExpectedBalanceChanges(innerCalls)).toBeUndefined();
    expect(extractExpectedBalanceChanges([])).toBeUndefined();
  });

  it("throws on duplicate storeExpectedBalances", () => {
    expect(() =>
      extractExpectedBalanceChanges([storeCall, storeCall, compareCall]),
    ).toThrow(/exactly one storeExpectedBalances\/compareBalances pair/);
  });

  it("throws on storeExpectedBalances without compareBalances", () => {
    expect(() => extractExpectedBalanceChanges([storeCall])).toThrow(
      /exactly one storeExpectedBalances\/compareBalances pair/,
    );
  });

  it("throws on compareBalances without storeExpectedBalances", () => {
    expect(() => extractExpectedBalanceChanges([compareCall])).toThrow(
      /exactly one storeExpectedBalances\/compareBalances pair/,
    );
  });

  it("throws when compareBalances appears before storeExpectedBalances", () => {
    expect(() =>
      extractExpectedBalanceChanges([compareCall, storeCall]),
    ).toThrow(/compareBalances appears before storeExpectedBalances/);
  });
});
