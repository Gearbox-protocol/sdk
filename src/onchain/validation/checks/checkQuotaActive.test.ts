import { describe, expect, it } from "vitest";
import { TOK } from "../testing/tokens.js";
import { checkQuotaActive } from "./checkQuotaActive.js";

describe("checkQuotaActive", () => {
  it("names a token the keeper charges no rate for", () => {
    expect(checkQuotaActive({ token: TOK, isActive: false })).toEqual([
      { code: "quotaInactive", message: expect.any(String), token: TOK },
    ]);
  });

  it("stands down for a token with an active quota", () => {
    expect(checkQuotaActive({ token: TOK, isActive: true })).toEqual([]);
  });
});
