import type { Address } from "viem";
import { describe, expect, it } from "vitest";

import { buildCreditManager, buildQuota } from "../__test-utils.js";
import { isUsableToken } from "./is-usable-token.js";

describe("isUsableToken", () => {
  const tokenAddr: Address = "0xtoken";

  it("returns true when activated and not forbidden", () => {
    const cm = buildCreditManager({
      forbiddenTokens: {},
      supportedTokens: { [tokenAddr]: true },
      liquidationThresholds: { [tokenAddr]: 100n },
      quotas: {
        [tokenAddr]: buildQuota({
          token: tokenAddr,
          rate: 0n,
          limit: 100n,
          isActive: true,
        }),
      },
    } as any);

    expect(
      isUsableToken({ address: tokenAddr, creditManager: cm as any }),
    ).toBe(true);
  });

  it("returns false when forbidden", () => {
    const cm = buildCreditManager({
      forbiddenTokens: { [tokenAddr]: true },
      supportedTokens: { [tokenAddr]: true },
      liquidationThresholds: { [tokenAddr]: 100n },
      quotas: {
        [tokenAddr]: buildQuota({
          token: tokenAddr,
          rate: 0n,
          limit: 100n,
        }),
      },
    } as any);

    expect(
      isUsableToken({ address: tokenAddr, creditManager: cm as any }),
    ).toBe(false);
  });

  it("returns false when not activated", () => {
    const cm = buildCreditManager({
      forbiddenTokens: {},
      supportedTokens: {},
      quotas: {},
    } as any);

    expect(
      isUsableToken({ address: tokenAddr, creditManager: cm as any }),
    ).toBe(false);
  });
});
