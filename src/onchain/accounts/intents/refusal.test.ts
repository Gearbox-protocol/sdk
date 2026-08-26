import { describe, expect, it } from "vitest";

import { refuse } from "./refusal.js";

describe("refuse — a reason and the numbers behind it", () => {
  it("carries the detail it was built with", () => {
    expect(
      refuse("marketExpired", { creditManager: "0x1", expirationDate: 1000 }),
    ).toEqual({
      ok: false,
      reason: "marketExpired",
      detail: { creditManager: "0x1", expirationDate: 1000 },
    });
  });

  it("leaves a reason with nothing to report undefined", () => {
    expect(refuse("noRecordedIntent", undefined)).toEqual({
      ok: false,
      reason: "noRecordedIntent",
      detail: undefined,
    });
  });
});
