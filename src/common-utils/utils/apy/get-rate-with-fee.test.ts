import { describe, expect, it } from "vitest";
import { PERCENTAGE_FACTOR } from "../../../sdk/index.js";
import { getRateWithFee } from "./get-rate-with-fee.js";

describe("getRateWithFee", () => {
  it("adds fee interest to rate when rate is number", () => {
    const rate = 1000; // 10%
    const feeInterest = 200; // 2%
    const expected = (1000n * (200n + PERCENTAGE_FACTOR)) / PERCENTAGE_FACTOR;

    const result = getRateWithFee(rate, feeInterest);

    expect(result).toBe(expected);
  });

  it("adds fee interest to rate when rate is bigint", () => {
    const rate = 1000n; // 10%
    const feeInterest = 200; // 2%
    const expected = (1000n * (200n + PERCENTAGE_FACTOR)) / PERCENTAGE_FACTOR;

    const result = getRateWithFee(rate, feeInterest);

    expect(result).toBe(expected);
  });

  it("handles zero fee interest", () => {
    const rate = 1000n;
    const feeInterest = 0;
    const expected = (1000n * (0n + PERCENTAGE_FACTOR)) / PERCENTAGE_FACTOR;

    const result = getRateWithFee(rate, feeInterest);

    expect(result).toBe(expected);
  });
});
