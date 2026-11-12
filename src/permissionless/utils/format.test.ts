import { describe, expect, it } from "vitest";
import { convertPercent } from "./format.js";

describe("convertPercent", () => {
  it("rounds to the nearest basis point", () => {
    // 1.15 * 100 is 114.99999999999999 in floating point
    expect(convertPercent(1.15)).toBe(115);
    expect(convertPercent(4.35)).toBe(435);
    expect(convertPercent(0.29)).toBe(29);
    expect(convertPercent(100)).toBe(10_000);
    expect(convertPercent(0)).toBe(0);
  });
});
