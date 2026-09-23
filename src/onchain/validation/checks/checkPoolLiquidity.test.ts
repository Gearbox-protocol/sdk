import { describe, expect, it } from "vitest";
import { UND } from "../testing/tokens.js";
import { checkPoolLiquidity } from "./checkPoolLiquidity.js";

describe("checkPoolLiquidity", () => {
  const at = (requested: bigint, available: bigint) =>
    checkPoolLiquidity({ requested, available, underlying: UND });

  it("serves a withdrawal of exactly what the pool can hand over", () => {
    expect(at(100n, 100n)).toEqual([]);
  });

  it("refuses a withdrawal above it", () => {
    expect(at(101n, 100n)).toEqual([
      {
        code: "insufficientPoolLiquidity",
        message: expect.any(String),
        requested: { token: UND, value: 101n, valueUsd: null },
        available: { token: UND, value: 100n, valueUsd: null },
        limit: "poolAvailableLiquidity",
      },
    ]);
  });
});
