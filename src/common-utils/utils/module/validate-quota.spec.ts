import type { Asset } from "@gearbox-protocol/sdk";
import { describe, expect, it } from "vitest";
import {
  buildCreditManager,
  buildQuota,
  mockToken1,
  mockToken2,
} from "../../../test-utils";
import { validateQuota } from "./validate-quota.js";

const mockCreditManager = buildCreditManager({
  minDebt: 1000n,
  maxDebt: 1000000n,
  totalDebtLimit: 5000000n,
  totalDebt: 2000000n,
  availableToBorrow: 3000000n,
  quotas: {
    [mockToken1]: buildQuota({
      token: mockToken1,
      limit: 1000000n,
      totalQuoted: 500000n,
      rate: 0n,
    }),
    [mockToken2]: buildQuota({
      token: mockToken2,
      limit: 2000000n,
      totalQuoted: 1000000n,
      rate: 0n,
    }),
  },
  maxEnabledTokensLength: 2,
});

describe("validateQuota", () => {
  it("returns null when all conditions are met", () => {
    const result = validateQuota({
      desiredQuota: {},
      quotaUpdate: [],
      creditManager: mockCreditManager,
      throwOnZeroQuotaUpdate: false,
    });
    expect(result).toBeNull();
  });

  it("returns error when max quotas length is reached", () => {
    const result = validateQuota({
      desiredQuota: {
        [mockToken1]: { token: mockToken1, balance: 1000n } as Asset,
        [mockToken2]: { token: mockToken2, balance: 1000n } as Asset,
      },
      quotaUpdate: [],
      creditManager: buildCreditManager({
        ...mockCreditManager,
        maxEnabledTokensLength: 1,
      }),
      throwOnZeroQuotaUpdate: false,
    });
    expect(result).toEqual({
      message: "maxQuotasLengthReached",
      count: 2,
      max: 1,
    });
  });

  it("returns error when quota update is empty and throwOnZeroQuotaUpdate is true", () => {
    const result = validateQuota({
      desiredQuota: {},
      quotaUpdate: [],
      creditManager: mockCreditManager,
      throwOnZeroQuotaUpdate: true,
    });
    expect(result).toEqual({
      message: "quotaShouldBeUpdated",
    });
  });

  it("returns error when quota is insufficient", () => {
    const result = validateQuota({
      desiredQuota: {},
      quotaUpdate: [{ token: mockToken1, balance: 600000n } as Asset],
      creditManager: mockCreditManager,
      throwOnZeroQuotaUpdate: false,
    });
    expect(result).toEqual({
      message: "insufficientQuota",
      token: mockToken1,
    });
  });
});
