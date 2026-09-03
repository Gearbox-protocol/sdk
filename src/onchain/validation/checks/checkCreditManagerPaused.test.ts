import { describe, expect, it } from "vitest";
import { CM } from "../testing/tokens.js";
import { checkCreditManagerPaused } from "./checkCreditManagerPaused.js";

describe("checkCreditManagerPaused", () => {
  it("passes an operable manager", () => {
    expect(
      checkCreditManagerPaused({ isPaused: false, creditManager: CM }),
    ).toEqual([]);
  });

  it("names the manager that is paused", () => {
    expect(
      checkCreditManagerPaused({ isPaused: true, creditManager: CM }),
    ).toEqual([
      {
        code: "creditManagerPaused",
        message: expect.any(String),
        creditManager: CM,
      },
    ]);
  });
});
