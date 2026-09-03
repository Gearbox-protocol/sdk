import { describe, expect, it } from "vitest";
import { CM } from "../testing/tokens.js";
import { checkMarketExpired } from "./checkMarketExpired.js";

describe("checkMarketExpired", () => {
  it("passes a facade that has not expired", () => {
    expect(
      checkMarketExpired({
        isExpired: false,
        creditManager: CM,
        expirationDate: 0,
      }),
    ).toEqual([]);
  });

  it("names the manager that expired, and when", () => {
    expect(
      checkMarketExpired({
        isExpired: true,
        creditManager: CM,
        expirationDate: 1000,
      }),
    ).toEqual([
      {
        code: "marketExpired",
        message: expect.any(String),
        creditManager: CM,
        expirationDate: 1000,
      },
    ]);
  });
});
