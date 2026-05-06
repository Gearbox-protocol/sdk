import { describe, expect, it } from "vitest";

import {
  buildCreditManager,
  buildPool,
  buildQuota,
  mockToken1,
  mockToken2,
  mockUnderlyingToken,
} from "../__test-utils.js";

import { validateOpenAccountPoolStatus } from "./validate-open-account-pool-status.js";

// Test data setup

const mockCreditManager = buildCreditManager({
  minDebt: 1000n,
  maxDebt: 1000000n,
  totalDebtLimit: 5000000n,
  totalDebt: 2000000n,
  availableToBorrow: 3000000n,
  liquidationThresholds: {
    [mockToken1]: 8000n,
    [mockToken2]: 9000n,
    [mockUnderlyingToken]: 9900n,
  },
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
  supportedTokens: {
    [mockToken1]: true,
    [mockToken2]: true,
    [mockUnderlyingToken]: true,
  },
  forbiddenTokens: {},
});

const mockPool = buildPool({
  totalDebtLimit: 10000000n,
  totalBorrowed: 5000000n,
});

describe("validateOpenAccountPoolStatus", () => {
  const testCases = [
    {
      label: "should return null when all conditions are met",
      props: {
        debt: 50000n,
        creditManager: mockCreditManager,
        pool: mockPool,
        targetToken: mockToken1,
      },
      expected: null,
    },
    {
      label: "should return error when debt exceeds debt limit",
      props: {
        debt: 4000000n, // Exceeds debt limit left (3M)
        creditManager: mockCreditManager,
        pool: mockPool,
        targetToken: mockToken1,
      },
      expected: {
        amount: 3000000n,
        message: "insufficientDebtLimit",
        solutionAmount: 3000000n,
      },
    },
    {
      label: "should return error when debt exceeds pool debt limit",
      props: {
        debt: 6000000n, // Exceeds pool debt limit left (5M)
        creditManager: buildCreditManager({
          ...mockCreditManager,
          totalDebtLimit: -1n,
        }), // Set to negative to disable debt limit check
        pool: mockPool,
        targetToken: mockToken1,
      },
      expected: {
        amount: 5000000n,
        message: "insufficientPoolDebtLimit",
        solutionAmount: undefined,
      },
    },
    {
      label: "should return error when debt exceeds available liquidity",
      props: {
        debt: 4000000n, // Exceeds available liquidity (3M)
        creditManager: buildCreditManager({
          ...mockCreditManager,
          totalDebtLimit: -1n,
        }), // Set to negative to disable debt limit check
        pool: buildPool({
          totalDebtLimit: -1n,
        }), // Set to negative to disable pool debt limit check
        targetToken: mockToken1,
      },
      expected: {
        amount: 3000000n,
        message: "insufficientPoolLiquidity",
        solutionAmount: undefined,
      },
    },
    {
      label: "should return error when quota is insufficient",
      props: {
        debt: 600000n, // Exceeds quota left (500k)
        creditManager: mockCreditManager,
        pool: mockPool,
        targetToken: mockToken1,
      },
      expected: {
        message: "insufficientQuota",
        token: "0x1111111111111111111111111111111111111111",
      },
    },
    {
      label: "should return null when targetToken is null",
      props: {
        debt: 50000n,
        creditManager: mockCreditManager,
        pool: mockPool,
        targetToken: null,
      },
      expected: null,
    },
  ];

  it.each(testCases)("$label", ({ props, expected }) => {
    const result = validateOpenAccountPoolStatus(props);
    if (expected === null) {
      expect(result).toBeNull();
    } else {
      expect(result).toEqual(expected);
    }
  });
});
