import { describe, expect, it } from "vitest";
import { checkLeverage } from "./checkLeverage.js";

describe("checkLeverage", () => {
  it("draws the line at 1x itself", () => {
    expect(checkLeverage({ leverage: 100n, min: 100n })).toEqual([]);
    expect(checkLeverage({ leverage: 99n, min: 100n })).toEqual([
      {
        code: "leverageOutOfRange",
        message: expect.any(String),
        requested: 99n,
        min: 100n,
      },
    ]);
  });
});
