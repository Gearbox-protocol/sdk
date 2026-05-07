import type { Address } from "viem";
import { describe, expect, it } from "vitest";

import { buildCreditManager, buildQuota } from "../__test-utils.js";
import type { CreditManagerDataSlice } from "../types.js";
import { isStrategyDisabled } from "./is-strategy-disabled.js";

describe("isStrategyDisabled", () => {
  const tokenOut: Address = "0xout";

  it("returns true when no credit managers provided", () => {
    expect(isStrategyDisabled(tokenOut, [])).toBe(true);
  });

  it("returns true when quotas are missing for token", () => {
    const cms = [
      buildCreditManager({
        availableToBorrow: 100n,
      }) as CreditManagerDataSlice,
    ];
    expect(isStrategyDisabled(tokenOut, cms)).toBe(true);
  });

  it("returns false when at least one CM has quota and liquidity", () => {
    const cms = [
      buildCreditManager({
        minDebt: 10n,
        availableToBorrow: 100n,
        quotas: {
          [tokenOut]: buildQuota({
            token: tokenOut,
            rate: 0n,
            limit: 100n,
            totalQuoted: 20n,
          }),
        },
      }) as CreditManagerDataSlice,
    ];

    expect(isStrategyDisabled(tokenOut, cms)).toBe(false);
  });

  it("returns true when quotaLeft is below minDebt", () => {
    const cms = [
      buildCreditManager({
        minDebt: 10n,
        availableToBorrow: 100n,
        quotas: {
          [tokenOut]: buildQuota({
            token: tokenOut,
            limit: 15n,
            totalQuoted: 10n,
            rate: 0n,
          }),
        },
      }) as CreditManagerDataSlice,
    ];

    expect(isStrategyDisabled(tokenOut, cms)).toBe(true);
  });

  it("returns true when availableToBorrow is below minDebt", () => {
    const cms = [
      buildCreditManager({
        minDebt: 10n,
        availableToBorrow: 5n,
        quotas: {
          [tokenOut]: buildQuota({
            token: tokenOut,
            limit: 50n,
            rate: 0n,
          }),
        },
      }) as CreditManagerDataSlice,
    ];

    expect(isStrategyDisabled(tokenOut, cms)).toBe(true);
  });
});
