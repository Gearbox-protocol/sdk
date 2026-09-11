import { describe, expect, it } from "vitest";
import { checkQuotaCount } from "./checkQuotaCount.js";

describe("checkQuotaCount", () => {
  it("counts quoted tokens with `>`, so count === max is allowed", () => {
    expect(checkQuotaCount({ count: 2, max: 2 })).toEqual([]);
    expect(checkQuotaCount({ count: 3, max: 2 })).toEqual([
      {
        code: "quotaCountExceeded",
        message: expect.any(String),
        count: 3,
        max: 2,
      },
    ]);
  });
});
