import type { Address } from "viem";
import { getAddress } from "viem";
import { describe, expect, it } from "vitest";

import type { WithdrawalOutput } from "../../accounts/withdrawal-compressor/index.js";
import { DUST_THRESHOLD } from "../../constants/index.js";
import { expectedBalanceDeltas } from "./expectedBalanceDeltas.js";

const TOKEN_A = getAddress("0xaaaa000000000000000000000000000000000001");
const TOKEN_B = getAddress("0xbbbb000000000000000000000000000000000002");
const SPENT = getAddress("0xcccc000000000000000000000000000000000003");

const lower = (a: Address) => a.toLowerCase() as Address;

describe("expectedBalanceDeltas", () => {
  it("sums duplicate tokens case-insensitively and shaves the dust threshold", () => {
    expect(
      expectedBalanceDeltas({
        outputs: [
          { token: TOKEN_A, amount: 100n },
          { token: lower(TOKEN_A), amount: 50n },
          { token: TOKEN_B, amount: 200n },
        ],
        spentToken: SPENT,
        spentAmount: 0n,
      }),
    ).toEqual([
      { token: TOKEN_A, amount: 150n - DUST_THRESHOLD },
      { token: TOKEN_B, amount: 200n - DUST_THRESHOLD },
    ]);
  });

  it("drops tokens whose summed amount is at or below the dust threshold", () => {
    expect(
      expectedBalanceDeltas({
        outputs: [
          { token: TOKEN_A, amount: DUST_THRESHOLD },
          { token: TOKEN_B, amount: DUST_THRESHOLD + 1n },
        ],
        spentToken: SPENT,
        spentAmount: 0n,
      }),
    ).toEqual([{ token: TOKEN_B, amount: 1n }]);
  });

  it("appends the negative delta of the spent token last", () => {
    expect(
      expectedBalanceDeltas({
        outputs: [{ token: TOKEN_A, amount: 100n }],
        spentToken: SPENT,
        spentAmount: 70n,
      }),
    ).toEqual([
      { token: TOKEN_A, amount: 100n - DUST_THRESHOLD },
      { token: SPENT, amount: -70n },
    ]);
  });

  it("omits the negative delta when nothing is spent", () => {
    expect(
      expectedBalanceDeltas({
        outputs: [{ token: TOKEN_A, amount: 100n }],
        spentToken: SPENT,
        spentAmount: 0n,
      }),
    ).toEqual([{ token: TOKEN_A, amount: 100n - DUST_THRESHOLD }]);
  });

  it("accepts withdrawal outputs and counts delayed ones too", () => {
    const outputs: WithdrawalOutput[] = [
      { token: TOKEN_A, amount: 100n, isDelayed: false },
      { token: TOKEN_B, amount: 200n, isDelayed: true },
    ];

    expect(
      expectedBalanceDeltas({ outputs, spentToken: SPENT, spentAmount: 1n }),
    ).toEqual([
      { token: TOKEN_A, amount: 100n - DUST_THRESHOLD },
      { token: TOKEN_B, amount: 200n - DUST_THRESHOLD },
      { token: SPENT, amount: -1n },
    ]);
  });

  it("returns no deltas for empty outputs and nothing spent", () => {
    expect(
      expectedBalanceDeltas({
        outputs: [],
        spentToken: SPENT,
        spentAmount: 0n,
      }),
    ).toEqual([]);
  });
});
