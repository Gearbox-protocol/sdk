import type { Address } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildCreditManager } from "../../../test-utils";
import { isUsableToken } from "../../utils/strategies/tokens/is-usable-token.js";
import { isObtainableToken } from "./is-obtainable-token.js";

vi.mock("../../utils/strategies/tokens/is-usable-token.js", async () => {
  const actual = await vi.importActual(
    "../../utils/strategies/tokens/is-usable-token.js",
  );
  return {
    ...(actual as object),
    isUsableToken: vi.fn(
      (actual as { isUsableToken: typeof isUsableToken }).isUsableToken,
    ),
  };
});

const mockIsUsableToken = vi.mocked(isUsableToken);

describe("isObtainableToken", () => {
  const tokenAddr: Address = "0xtoken";

  beforeEach(async () => {
    mockIsUsableToken.mockReset();
    const actual = await vi.importActual(
      "../../utils/strategies/tokens/is-usable-token.js",
    );
    mockIsUsableToken.mockImplementation(
      (actual as { isUsableToken: typeof isUsableToken }).isUsableToken,
    );
  });

  it("returns true when usable, not delayed phantom, and quota has room", () => {
    const cm = buildCreditManager({
      quotas: {
        [tokenAddr]: {
          token: tokenAddr,
          rate: 0n,
          limit: 100n,
          totalQuoted: 0n,
          isActive: true,
          quotaIncreaseFee: 0n,
        },
      },
      isQuoted: vi.fn<() => boolean>().mockReturnValue(true),
    });

    mockIsUsableToken.mockReturnValue(true);

    const result = isObtainableToken({
      address: tokenAddr,
      creditManager: {
        quotas: cm.quotas,
        isQuoted: cm.isQuoted.bind(cm),
        forbiddenTokens: cm.forbiddenTokens,
        liquidationThresholds: cm.liquidationThresholds,
        supportedTokens: cm.supportedTokens,
      },
      delayedPhantoms: {},
    });

    expect(cm.isQuoted).toHaveBeenCalledWith(tokenAddr);
    expect(result).toBe(true);
  });

  it("returns true when usable, not delayed phantom, and not quoted", () => {
    const cm = buildCreditManager({
      quotas: {},
      isQuoted: vi.fn<() => boolean>().mockReturnValue(false),
    });

    mockIsUsableToken.mockReturnValue(true);

    const result = isObtainableToken({
      address: tokenAddr,
      creditManager: {
        quotas: cm.quotas,
        isQuoted: cm.isQuoted.bind(cm),
        forbiddenTokens: cm.forbiddenTokens,
        liquidationThresholds: cm.liquidationThresholds,
        supportedTokens: cm.supportedTokens,
      },
      delayedPhantoms: {},
    });

    expect(cm.isQuoted).toHaveBeenCalledWith(tokenAddr);
    expect(result).toBe(true);
  });

  it("returns false when isUsableToken is false", () => {
    const cm = buildCreditManager({
      quotas: {
        [tokenAddr]: {
          token: tokenAddr,
          rate: 0n,
          limit: 100n,
          totalQuoted: 0n,
          isActive: true,
          quotaIncreaseFee: 0n,
        },
      },
      isQuoted: vi.fn<() => boolean>().mockReturnValue(true),
    });

    mockIsUsableToken.mockReturnValue(false);

    const result = isObtainableToken({
      address: tokenAddr,
      creditManager: {
        quotas: cm.quotas,
        isQuoted: cm.isQuoted.bind(cm),
        forbiddenTokens: cm.forbiddenTokens,
        liquidationThresholds: cm.liquidationThresholds,
        supportedTokens: cm.supportedTokens,
      },
      delayedPhantoms: {},
    });

    expect(result).toBe(false);
  });

  it("returns false when quotaLeft is zero or negative", () => {
    const cm = buildCreditManager({
      quotas: {
        [tokenAddr]: {
          token: tokenAddr,
          rate: 0n,
          limit: 0n,
          totalQuoted: 10n,
          isActive: true,
          quotaIncreaseFee: 0n,
        },
      },
      isQuoted: vi.fn<() => boolean>().mockReturnValue(true),
    });

    mockIsUsableToken.mockReturnValue(true);

    const result = isObtainableToken({
      address: tokenAddr,
      creditManager: {
        quotas: cm.quotas,
        isQuoted: cm.isQuoted.bind(cm),
        forbiddenTokens: cm.forbiddenTokens,
        liquidationThresholds: cm.liquidationThresholds,
        supportedTokens: cm.supportedTokens,
      },
      delayedPhantoms: {},
    });

    expect(result).toBe(false);
  });

  it("returns false when token is delayed phantom", () => {
    const cm = buildCreditManager({
      quotas: {
        [tokenAddr]: {
          token: tokenAddr,
          rate: 0n,
          limit: 100n,
          totalQuoted: 0n,
          isActive: true,
          quotaIncreaseFee: 0n,
        },
      },
      isQuoted: vi.fn<() => boolean>().mockReturnValue(true),
    });

    mockIsUsableToken.mockReturnValue(true);

    const result = isObtainableToken({
      address: tokenAddr,
      creditManager: {
        quotas: cm.quotas,
        isQuoted: cm.isQuoted.bind(cm),
        forbiddenTokens: cm.forbiddenTokens,
        liquidationThresholds: cm.liquidationThresholds,
        supportedTokens: cm.supportedTokens,
      },
      delayedPhantoms: { [tokenAddr]: true },
    });

    expect(result).toBe(false);
  });
});
