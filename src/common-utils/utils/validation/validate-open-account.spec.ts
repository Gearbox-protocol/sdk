import { describe, expect, it } from "vitest";
import {
  buildCreditManager,
  mockUnderlyingToken,
} from "../../test-utils/index.js";
import { validateOpenAccount } from "./validate-open-account.js";

const mockCreditManager = buildCreditManager({
  minDebt: 1000n,
  maxDebt: 1000000n,
  underlyingToken: mockUnderlyingToken,
});

describe("validateOpenAccount", () => {
  it("returns null when all conditions are met", () => {
    const result = validateOpenAccount({
      debt: 50000n,
      creditManager: mockCreditManager,
      desiredQuota: {},
      quotaUpdate: [],
    });
    expect(result).toBeNull();
  });

  it("returns loading error when loading is true", () => {
    const result = validateOpenAccount({
      debt: 50000n,
      creditManager: mockCreditManager,
      desiredQuota: {},
      quotaUpdate: [],
      loading: true,
    });
    expect(result).toEqual({ message: "loading" });
  });

  it("returns error when debt is less than min", () => {
    const result = validateOpenAccount({
      debt: 500n,
      creditManager: mockCreditManager,
      desiredQuota: {},
      quotaUpdate: [],
    });
    expect(result).toEqual({
      message: "amountLessMin",
      amount: 1000n,
    });
  });

  it("returns error when debt is greater than max", () => {
    const result = validateOpenAccount({
      debt: 2000000n,
      creditManager: mockCreditManager,
      desiredQuota: {},
      quotaUpdate: [],
    });
    expect(result).toEqual({
      message: "debtGreaterMax",
      amount: 1000000n,
    });
  });
});
