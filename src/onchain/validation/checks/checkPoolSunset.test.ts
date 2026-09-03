import { describe, expect, it } from "vitest";
import { POOL } from "../testing/tokens.js";
import { checkPoolSunset } from "./checkPoolSunset.js";

describe("checkPoolSunset", () => {
  it("refuses a deposit into a sunset pool but lets the withdrawal through", () => {
    expect(
      checkPoolSunset({ isSunset: true, isDeposit: true, pool: POOL }),
    ).toEqual([
      { code: "poolSunset", message: expect.any(String), pool: POOL },
    ]);
    expect(
      checkPoolSunset({ isSunset: true, isDeposit: false, pool: POOL }),
    ).toEqual([]);
  });

  it("stands down for a pool that is not winding down", () => {
    expect(
      checkPoolSunset({ isSunset: false, isDeposit: true, pool: POOL }),
    ).toEqual([]);
  });
});
