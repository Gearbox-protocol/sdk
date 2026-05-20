import type { Address } from "viem";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ADDRESS_0X0, toBN } from "../../../../sdk/index.js";

import {
  buildCreditManager,
  buildPool,
  mockToken1,
} from "../../../test-utils/index.js";
import type * as CheckDegenNftModule from "../availability/check-degen-nft.js";
import { checkDegenNFT } from "../availability/check-degen-nft.js";
import type * as ValidatePoolStatusModule from "../availability/validate-open-account-pool-status.js";
import { validateOpenAccountPoolStatus } from "../availability/validate-open-account-pool-status.js";
import { cmAvailabilityCondition } from "./cm-availability-condition.js";
import type { PoolSlice } from "./types.js";

// Mock dependencies
vi.mock("../creditManagers");
vi.mock("../strategies");
vi.mock("../availability/check-degen-nft.js", async importOriginal => {
  const actual = await importOriginal<typeof CheckDegenNftModule>();

  return {
    ...actual,
    checkDegenNFT: vi.fn(),
  };
});
vi.mock(
  "../availability/validate-open-account-pool-status.js",
  async importOriginal => {
    const actual = await importOriginal<typeof ValidatePoolStatusModule>();

    return {
      ...actual,
      validateOpenAccountPoolStatus: vi.fn(),
    };
  },
);
vi.mock("@gearbox-protocol/ui-kit", () => ({
  getAvailableRanges: vi.fn(),
}));

const mockCheckDegenNFT = vi.mocked(checkDegenNFT);

const mockValidateOpenAccountPoolStatus = vi.mocked(
  validateOpenAccountPoolStatus,
);

describe("cmAvailabilityCondition", () => {
  const mockCMA = buildCreditManager({
    address: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    minDebt: toBN("100", 18),
    maxDebt: toBN("10000", 18),
  });

  const mockCMB = buildCreditManager({
    address: "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    minDebt: toBN("200", 18),
    maxDebt: toBN("20000", 18),
  });

  const mockPool = buildPool({
    totalDebtLimit: toBN("1000000", 18),
    totalBorrowed: toBN("500000", 18),
  });
  const mockPools: Record<Address, PoolSlice> = {
    [mockPool.address]: mockPool,
  };

  beforeEach(() => {
    mockValidateOpenAccountPoolStatus.mockReturnValue(null);
    mockCheckDegenNFT.mockReturnValue({
      nftAddress: ADDRESS_0X0,
      freeOfNFT: true,
    });
  });

  it("should return 0 when both CMs have same availability", () => {
    mockValidateOpenAccountPoolStatus.mockReturnValue(null);

    const result = cmAvailabilityCondition(
      mockToken1,
      mockCMA,
      mockCMB,
      mockPools,
    );

    expect(result).toBe(0);
  });

  it("should return -1 when CMA has no min debt error and CMB has error", () => {
    mockValidateOpenAccountPoolStatus
      .mockReturnValueOnce(null) // CMA min debt check
      .mockReturnValueOnce({
        message: "insufficientDebtLimit",
        amount: 0n,
        solutionAmount: undefined,
      }) // CMB min debt check
      .mockReturnValueOnce(null) // CMA max debt check
      .mockReturnValueOnce(null); // CMB max debt check

    const result = cmAvailabilityCondition(
      mockToken1,
      mockCMA,
      mockCMB,
      mockPools,
    );

    expect(result).toBe(-1);
  });

  it("should return 1 when CMA has min debt error and CMB has no error", () => {
    mockValidateOpenAccountPoolStatus
      .mockReturnValueOnce({
        message: "insufficientDebtLimit",
        amount: 0n,
        solutionAmount: undefined,
      }) // CMA min debt check
      .mockReturnValueOnce(null) // CMB min debt check
      .mockReturnValueOnce(null) // CMA max debt check
      .mockReturnValueOnce(null); // CMB max debt check

    const result = cmAvailabilityCondition(
      mockToken1,
      mockCMA,
      mockCMB,
      mockPools,
    );

    expect(result).toBe(1);
  });

  it("should prioritize NFT-free CMs when min debt availability is same", () => {
    mockValidateOpenAccountPoolStatus.mockReturnValue(null);
    mockCheckDegenNFT
      .mockReturnValueOnce({ nftAddress: ADDRESS_0X0, freeOfNFT: false }) // CMA
      .mockReturnValueOnce({ nftAddress: ADDRESS_0X0, freeOfNFT: true }); // CMB

    const result = cmAvailabilityCondition(
      mockToken1,
      mockCMA,
      mockCMB,
      mockPools,
    );

    expect(result).toBe(1); // CMB should be preferred
  });

  it("should check max debt when min debt and NFT status are same", () => {
    mockValidateOpenAccountPoolStatus
      .mockReturnValueOnce(null) // CMA min debt
      .mockReturnValueOnce(null) // CMB min debt
      .mockReturnValueOnce({
        message: "insufficientDebtLimit",
        amount: 0n,
        solutionAmount: undefined,
      }) // CMA max debt
      .mockReturnValueOnce(null); // CMB max debt

    const result = cmAvailabilityCondition(
      mockToken1,
      mockCMA,
      mockCMB,
      mockPools,
    );

    expect(result).toBe(1); // CMB should be preferred
  });

  it("should call validateOpenAccountPoolStatus with correct parameters", () => {
    mockValidateOpenAccountPoolStatus.mockReturnValue(null);

    cmAvailabilityCondition(mockToken1, mockCMA, mockCMB, null);

    expect(mockValidateOpenAccountPoolStatus).toHaveBeenCalledWith({
      pool: undefined,
      debt: mockCMA.minDebt,
      creditManager: mockCMA,
      targetToken: mockToken1,
    });

    expect(mockValidateOpenAccountPoolStatus).toHaveBeenCalledWith({
      pool: undefined,
      debt: mockCMB.minDebt,
      creditManager: mockCMB,
      targetToken: mockToken1,
    });
  });
});
