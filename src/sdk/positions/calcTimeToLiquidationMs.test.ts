import { describe, expect, it } from "vitest";
import { calcTimeToLiquidationMs } from "./calcTimeToLiquidationMs.js";

describe("calcTimeToLiquidationMs", () => {
  it("matches the legacy getTimeToLiquidation numbers", () => {
    expect(calcTimeToLiquidationMs(9000, 250n)).toBe(null);
    expect(calcTimeToLiquidationMs(9000, 0n)).toBe(null);
    expect(calcTimeToLiquidationMs(13750, 20n * 10000n)).toBe(
      59130000n * 1000n,
    );
  });

  it("returns null when the debt carries no rate", () => {
    expect(calcTimeToLiquidationMs(10244, 0n)).toBe(null);
  });
});
