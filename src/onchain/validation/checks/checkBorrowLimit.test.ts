import { describe, expect, it } from "vitest";
import { checkBorrowLimit } from "./checkBorrowLimit.js";
import { UND } from "./testing/tokens.js";

describe("checkBorrowLimit", () => {
  const at = (requested: bigint, available: bigint) =>
    checkBorrowLimit({
      requested,
      available,
      limit: "poolAvailableLiquidity",
      underlying: UND,
    });

  it("accepts a draw that exactly exhausts the ceiling", () => {
    expect(at(100n, 100n)).toEqual([]);
  });

  it("names both sides and which limit ran out", () => {
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

  it("carries the position still openable only when there is one", () => {
    const [withMaxBorrow] = checkBorrowLimit({
      requested: 101n,
      available: 100n,
      limit: "poolDebtLimit",
      underlying: UND,
      maxBorrowAmount: 50n,
    });
    expect(withMaxBorrow).toMatchObject({
      maxBorrowAmount: { token: UND, value: 50n, valueUsd: null },
    });
    expect(at(101n, 100n)[0]).not.toHaveProperty("maxBorrowAmount");
  });
});
