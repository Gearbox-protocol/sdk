import { describe, expect, it } from "vitest";
import { TOK } from "../testing/tokens.js";
import { checkFunding } from "./checkFunding.js";

describe("checkFunding", () => {
  it("accepts a balance that exactly covers the amount", () => {
    expect(checkFunding({ token: TOK, required: 100n, held: 100n })).toEqual(
      [],
    );
  });

  it("names both sides of the shortfall", () => {
    expect(checkFunding({ token: TOK, required: 100n, held: 1n })).toEqual([
      {
        code: "insufficientBalance",
        message: expect.any(String),
        required: { token: TOK, value: 100n, valueUsd: null },
        held: { token: TOK, value: 1n, valueUsd: null },
      },
    ]);
  });

  it("says whose balance was short when the caller knows", () => {
    expect(
      checkFunding({
        token: TOK,
        required: 100n,
        held: 1n,
        holderKind: "wallet",
        holder: TOK.address,
      })[0],
    ).toMatchObject({ holderKind: "wallet", holder: TOK.address });
  });
});
