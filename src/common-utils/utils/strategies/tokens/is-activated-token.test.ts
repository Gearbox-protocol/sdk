import type { Address } from "viem";
import { describe, expect, it } from "vitest";

import { buildCreditManager, buildQuota } from "../../../test-utils/index.js";
import { isActivatedToken } from "./is-activated-token.js";

describe("isActivatedToken", () => {
  const tokenAddr: Address = "0xtoken";

  it("returns true when supported, LT non-zero, and quota active", () => {
    const cm = buildCreditManager({
      supportedTokens: { [tokenAddr]: true },
      liquidationThresholds: { [tokenAddr]: 100n },
      quotas: {
        [tokenAddr]: buildQuota({
          token: tokenAddr,
          rate: 0n,
          limit: 0n,
        }),
      },
    } as any);

    expect(
      isActivatedToken({ address: tokenAddr, creditManager: cm as any }),
    ).toBe(true);
  });

  it("returns false when LT is zero", () => {
    const cm = buildCreditManager({
      supportedTokens: { [tokenAddr]: true },
      liquidationThresholds: { [tokenAddr]: 0n },
      quotas: {
        [tokenAddr]: buildQuota({
          token: tokenAddr,
          rate: 0n,
          limit: 0n,
        }),
      },
    } as any);

    expect(
      isActivatedToken({ address: tokenAddr, creditManager: cm as any }),
    ).toBe(false);
  });

  it("returns false when quota inactive", () => {
    const cm = buildCreditManager({
      supportedTokens: { [tokenAddr]: true },
      liquidationThresholds: { [tokenAddr]: 100n },
      quotas: {
        [tokenAddr]: buildQuota({
          token: tokenAddr,
          rate: 0n,
          limit: 0n,
          isActive: false,
        }),
      },
    } as any);

    expect(
      isActivatedToken({ address: tokenAddr, creditManager: cm as any }),
    ).toBe(false);
  });

  it("returns false when not supported", () => {
    const cm = buildCreditManager({
      supportedTokens: {},
      liquidationThresholds: { [tokenAddr]: 100n },
      quotas: {
        [tokenAddr]: buildQuota({
          token: tokenAddr,
          rate: 0n,
          limit: 0n,
        }),
      },
    } as any);

    expect(
      isActivatedToken({ address: tokenAddr, creditManager: cm as any }),
    ).toBe(false);
  });
});
