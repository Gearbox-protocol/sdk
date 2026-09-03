import { describe, expect, it } from "vitest";
import { checkPoolPayout } from "./checkPoolPayout.js";
import { UND } from "./testing/tokens.js";

describe("checkPoolPayout", () => {
  const at = (requested: bigint, available: bigint) =>
    checkPoolPayout({ requested, available, underlying: UND });

  it("refuses a payout the pool exactly holds", () => {
    // Not `checkBorrowLimit`'s operator: equality is already a refusal here,
    // which is the rule the legacy withdrawal validator enforced.
    expect(at(100n, 100n)).toEqual([
      {
        code: "insufficientPoolLiquidity",
        message: expect.any(String),
        requested: { token: UND, value: 100n, valueUsd: null },
        available: { token: UND, value: 100n, valueUsd: null },
        limit: "poolAvailableLiquidity",
      },
    ]);
  });

  it("serves a payout the pool has room above", () => {
    expect(at(99n, 100n)).toEqual([]);
  });
});
