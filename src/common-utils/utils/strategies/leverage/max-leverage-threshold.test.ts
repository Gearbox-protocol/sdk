import type { Address } from "viem";
import { describe, expect, it } from "vitest";

import { maxLeverageThreshold } from "./max-leverage-threshold.js";

describe("maxLeverageThreshold", () => {
  it("returns highest liquidation threshold and its CM address", () => {
    const lp: Address = "0xlp";
    const cms = [
      { address: "0x1", liquidationThresholds: { [lp]: 100n } } as const,
      { address: "0x2", liquidationThresholds: { [lp]: 200n } } as const,
    ];

    const [lt, cm] = maxLeverageThreshold(lp, cms);
    expect(lt).toBe(200n);
    expect(cm).toBe("0x2");
  });

  it("returns zero and empty when no cms", () => {
    const [lt, cm] = maxLeverageThreshold("0xlp", []);
    expect(lt).toBe(0n);
    expect(cm).toBe("");
  });
});
