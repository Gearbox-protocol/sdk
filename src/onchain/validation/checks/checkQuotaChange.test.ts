import { describe, expect, it } from "vitest";
import { TOK, UND } from "../testing/tokens.js";
import { checkQuotaChange } from "./checkQuotaChange.js";

describe("checkQuotaChange", () => {
  it("reports a change that rounds to zero, in the underlying", () => {
    expect(
      checkQuotaChange({
        token: TOK,
        current: 50_000n,
        requested: 55_000n,
        change: 0n,
        underlying: UND,
      }),
    ).toEqual([
      {
        code: "quotaUnchanged",
        message: expect.any(String),
        token: TOK,
        current: { token: UND, value: 50_000n, valueUsd: null },
        requested: { token: UND, value: 55_000n, valueUsd: null },
      },
    ]);
  });

  it("stands down for a nonzero change in either direction", () => {
    const at = (change: bigint) =>
      checkQuotaChange({
        token: TOK,
        current: 50_000n,
        requested: 0n,
        change,
        underlying: UND,
      });

    expect(at(10_000n)).toEqual([]);
    expect(at(-10_000n)).toEqual([]);
  });
});
