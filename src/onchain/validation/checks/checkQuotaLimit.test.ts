import { describe, expect, it } from "vitest";
import { TOK, UND } from "../testing/tokens.js";
import { checkQuotaLimit } from "./checkQuotaLimit.js";

describe("checkQuotaLimit", () => {
  it("allows an increase that exactly exhausts the available quota", () => {
    const at = (requested: bigint) =>
      checkQuotaLimit({
        token: TOK,
        requested,
        available: 500n,
        underlying: UND,
      });

    expect(at(500n)).toEqual([]);
    expect(at(501n)[0]?.code).toBe("quotaLimitReached");
  });

  it("reports no ceiling at all for a token the market quotes nothing for", () => {
    expect(
      checkQuotaLimit({
        token: TOK,
        requested: undefined,
        available: 0n,
        underlying: UND,
      }),
    ).toEqual([
      {
        code: "quotaLimitReached",
        message: expect.any(String),
        token: TOK,
        requested: undefined,
        available: { token: UND, value: 0n, valueUsd: null },
      },
    ]);
  });
});
