import type { Address } from "viem";
import { describe, expect, it } from "vitest";

import { skipLiquidatableAccount } from "./skipLiquidatableAccount.js";

const MELLOW = "0x0000000000000000000000000000000000000001" as Address;
const OTHER = "0x0000000000000000000000000000000000000002" as Address;

const lookup = (token: Address) =>
  token === MELLOW
    ? "PHANTOM_TOKEN::MELLOW_WITHDRAWAL"
    : "PHANTOM_TOKEN::MIDAS_REDEMPTION";

describe("skipLiquidatableAccount", () => {
  it.each([
    {
      name: "failed collateral",
      success: false,
      token: OTHER,
      skip: true,
    },
    {
      name: "mellow",
      success: true,
      token: MELLOW,
      skip: true,
    },
    {
      name: "other phantom",
      success: true,
      token: OTHER,
      skip: false,
    },
  ])("$name", ({ success, token, skip }) => {
    expect(
      skipLiquidatableAccount(
        {
          success,
          tokens: [
            { token, balance: 100n, mask: 0n, quota: 0n, success: true },
          ],
        },
        lookup,
      ),
    ).toBe(skip);
  });
});
