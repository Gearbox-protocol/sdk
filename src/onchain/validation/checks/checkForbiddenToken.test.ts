import { describe, expect, it } from "vitest";
import { checkForbiddenToken } from "./checkForbiddenToken.js";
import { TOK } from "./testing/tokens.js";

describe("checkForbiddenToken", () => {
  it("names the token the market forbids", () => {
    expect(checkForbiddenToken({ token: TOK, isForbidden: true })).toEqual([
      { code: "forbiddenToken", message: expect.any(String), token: TOK },
    ]);
  });

  it("stands down for a token the market allows", () => {
    expect(checkForbiddenToken({ token: TOK, isForbidden: false })).toEqual([]);
  });
});
