import { describe, expect, it } from "vitest";
import {
  buildCreditManager,
  buildQuota,
  mockToken1,
} from "../../test-utils/index.js";
import { validateOpenAccountPoolQuotaStatus } from "./validate-open-account-pool-quota-status.js";

const mockCreditManager = buildCreditManager({
  quotas: {
    [mockToken1]: buildQuota({
      token: mockToken1,
      limit: 1000000n,
      totalQuoted: 500000n,
      rate: 0n,
    }),
  },
});

describe("validateOpenAccountPoolQuotaStatus", () => {
  it("returns null when quota is sufficient", () => {
    const result = validateOpenAccountPoolQuotaStatus(
      mockToken1,
      mockCreditManager,
      100000n,
    );
    expect(result).toBeNull();
  });

  it("returns error when quota is insufficient", () => {
    const result = validateOpenAccountPoolQuotaStatus(
      mockToken1,
      mockCreditManager,
      600000n,
    );
    expect(result).toEqual({
      message: "insufficientQuota",
      token: mockToken1,
    });
  });

  it("returns null when token has no quota", () => {
    const result = validateOpenAccountPoolQuotaStatus(
      "0x9999999999999999999999999999999999999999",
      mockCreditManager,
      100000n,
    );
    expect(result).toBeNull();
  });
});
