import { describe, expect, it } from "vitest";
import {
  buildCreditManager,
  buildPool,
  buildQuota,
  mockToken1,
} from "../../../test-utils";
import { validateOpenAccountPoolStatus } from "./validate-open-account-pool-status.js";

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
  },
});

const mockPool = buildPool({
  totalDebtLimit: 10000000n,
  totalBorrowed: 5000000n,
});

describe("validateOpenAccountPoolStatus", () => {
  it("returns null when all conditions are met", () => {
    const result = validateOpenAccountPoolStatus({
      debt: 50000n,
      creditManager: mockCreditManager,
      pool: mockPool,
      targetToken: mockToken1,
    });
    expect(result).toBeNull();
  });

  it("returns error when debt exceeds debt limit", () => {
    const result = validateOpenAccountPoolStatus({
      debt: 4000000n,
      creditManager: mockCreditManager,
      pool: mockPool,
      targetToken: mockToken1,
    });
    expect(result).toEqual({
      message: "insufficientDebtLimit",
      amount: 3000000n,
      solutionAmount: 3000000n,
    });
  });

  it("returns error when debt exceeds pool debt limit", () => {
    const result = validateOpenAccountPoolStatus({
      debt: 6000000n,
      creditManager: buildCreditManager({
        ...mockCreditManager,
        totalDebtLimit: -1n,
      }),
      pool: mockPool,
      targetToken: mockToken1,
    });
    expect(result).toEqual({
      message: "insufficientPoolDebtLimit",
      amount: 5000000n,
    });
  });

  it("returns error when debt exceeds available liquidity", () => {
    const result = validateOpenAccountPoolStatus({
      debt: 4000000n,
      creditManager: buildCreditManager({
        ...mockCreditManager,
        totalDebtLimit: -1n,
      }),
      pool: buildPool({ totalDebtLimit: -1n }),
      targetToken: mockToken1,
    });
    expect(result).toEqual({
      message: "insufficientPoolLiquidity",
      amount: 3000000n,
    });
  });

  it("returns error when quota is insufficient", () => {
    const result = validateOpenAccountPoolStatus({
      debt: 600000n,
      creditManager: mockCreditManager,
      pool: mockPool,
      targetToken: mockToken1,
    });
    expect(result).toEqual({
      message: "insufficientQuota",
      token: mockToken1,
    });
  });

  it("returns null when targetToken is null", () => {
    const result = validateOpenAccountPoolStatus({
      debt: 50000n,
      creditManager: mockCreditManager,
      pool: mockPool,
      targetToken: null,
    });
    expect(result).toBeNull();
  });
});
