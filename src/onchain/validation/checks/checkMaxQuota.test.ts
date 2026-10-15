import { describe, expect, it } from "vitest";
import { TOK, UND } from "../testing/tokens.js";
import { checkMaxQuota } from "./checkMaxQuota.js";

describe("checkMaxQuota", () => {
  it("allows a quota that exactly reaches maxQuota", () => {
    const at = (requested: bigint) =>
      checkMaxQuota({
        token: TOK,
        requested,
        maxQuota: 2000n,
        underlying: UND,
      });

    expect(at(2000n)).toEqual([]);
    expect(at(2001n)[0]?.code).toBe("quotaAboveMax");
  });

  it("reports both amounts in the underlying", () => {
    expect(
      checkMaxQuota({
        token: TOK,
        requested: 3000n,
        maxQuota: 2000n,
        underlying: UND,
      }),
    ).toEqual([
      {
        code: "quotaAboveMax",
        message: expect.any(String),
        token: TOK,
        requested: { token: UND, value: 3000n, valueUsd: null },
        maxQuota: { token: UND, value: 2000n, valueUsd: null },
      },
    ]);
  });
});
