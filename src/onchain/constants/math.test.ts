import { describe, expect, it } from "vitest";
import { DUST_THRESHOLD, isZeroBalance } from "./math.js";

describe("isZeroBalance", () => {
  it("counts anything up to the dust threshold as nothing", () => {
    expect(isZeroBalance(0n)).toBe(true);
    expect(isZeroBalance(DUST_THRESHOLD)).toBe(true);
    expect(isZeroBalance(DUST_THRESHOLD + 1n)).toBe(false);
  });

  it("treats an unread balance as nothing", () => {
    expect(isZeroBalance(undefined)).toBe(true);
  });
});
