import { describe, expect, it } from "vitest";
import { UND } from "../testing/tokens.js";
import { checkPoolLiquidity } from "./checkPoolLiquidity.js";

describe("checkPoolLiquidity", () => {
  const at = (requested: bigint, available: bigint) =>
    checkPoolLiquidity({ requested, available, underlying: UND });

  it("refuses a withdrawal the pool exactly holds", () => {
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

  it("serves a withdrawal the pool has room above", () => {
    expect(at(99n, 100n)).toEqual([]);
  });
});
