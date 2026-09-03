import { describe, expect, it } from "vitest";
import { AddressMap } from "../../utils/AddressMap.js";
import { TOK } from "../testing/tokens.js";
import { checkFundedFrom } from "./checkFundedFrom.js";

const put = (value: bigint) => ({ token: TOK, value, valueUsd: null });

describe("checkFundedFrom", () => {
  it("stands down when no balances were given", () => {
    expect(checkFundedFrom(undefined, [put(1n)])).toEqual([]);
  });

  it("treats a token absent from the map as 0n held", () => {
    expect(checkFundedFrom(new AddressMap<bigint>(), [put(1n)])).toMatchObject([
      {
        code: "insufficientBalance",
        required: { token: TOK, value: 1n, valueUsd: null },
        held: { token: TOK, value: 0n, valueUsd: null },
        holderKind: "wallet",
      },
    ]);
  });
});
