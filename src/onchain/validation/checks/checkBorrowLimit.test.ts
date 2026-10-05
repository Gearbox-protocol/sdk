import { describe, expect, it, vi } from "vitest";
import { UND } from "../testing/tokens.js";
import { checkBorrowLimit } from "./checkBorrowLimit.js";

describe("checkBorrowLimit", () => {
  const at = (requested: bigint, available: bigint) =>
    checkBorrowLimit({
      requested,
      available,
      limit: "poolAvailableLiquidity",
      underlying: UND,
    });

  it("accepts a borrow that exactly exhausts the available amount", () => {
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

it("builds collateral bounds lazily into the refusal", () => {
  const bounds = {
    min: { token: UND, value: 334n, valueUsd: null },
    max: { token: UND, value: 336n, valueUsd: null },
  };
  const getCollateralLimits = vi.fn(() => bounds);
  const args = {
    available: 100n,
    limit: "poolAvailableLiquidity" as const,
    underlying: UND,
    getCollateralLimits,
  };
  checkBorrowLimit({ ...args, requested: 100n });
  expect(getCollateralLimits).not.toHaveBeenCalled();
  const [error] = checkBorrowLimit({ ...args, requested: 101n });
  expect(getCollateralLimits).toHaveBeenCalledTimes(1);
  expect(error?.collateralLimits).toBe(bounds);
});
