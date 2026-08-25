import type { Address } from "viem";
import { describe, expect, it, vi } from "vitest";
import { toBN } from "../../../../onchain/index.js";
import {
  buildCreditManager,
  buildPool,
  mockToken1,
} from "../../../test-utils/index.js";
import { amountAbcComparator } from "../../creditAccount/sort.js";
import * as CmAvailabilityConditionModule from "../strategy-info/cm-availability-condition.js";
import * as GetStrategyMaxAPYModule from "../strategy-info/get-strategy-max-apy.js";
import type { APYListSlice, PoolSlice } from "../strategy-info/types.js";
import { sortStrategyCMsByAvailability } from "./sort-strategy-cms-by-availability.js";

vi.mock("../../creditAccount/sort", async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();

  return {
    ...actual,
    amountAbcComparator: vi.fn(),
  };
});

const mockGetStrategyMaxAPY = vi.spyOn(
  GetStrategyMaxAPYModule,
  "getStrategyMaxAPY",
);

describe("getBestCMForToken", () => {
  const mockAPYListByNetwork: Record<number, APYListSlice> = {
    1: {
      apyList: {
        [mockToken1]: 100,
      },
      extraCollateralAPYList: undefined,
    },
  };

  const mockPool = buildPool({
    totalDebtLimit: toBN("1000000", 18),
    totalBorrowed: toBN("500000", 18),
  });
  const mockPools: Record<Address, PoolSlice> = {
    [mockPool.address]: mockPool,
  };

  it("should return undefined when no credit managers provided", () => {
    const result = sortStrategyCMsByAvailability({
      targetToken: mockToken1,
      allCreditManagers: [],
      apyListByNetwork: mockAPYListByNetwork,
      pools: mockPools,
      slippage: 100,
      quotaReserve: 5,
      leverageLimit: 10,
      isStrategy: true,
    })?.[0];

    expect(result).toBeUndefined();
  });

  it("should sort credit managers by availability first", () => {
    const mockCM1 = buildCreditManager({
      address: "0x1111",
    });
    const mockCM2 = buildCreditManager({
      address: "0x2222",
    });

    vi.spyOn(
      CmAvailabilityConditionModule,
      "cmAvailabilityCondition",
    ).mockImplementation(
      // eslint-disable-next-line max-nested-callbacks
      (_targetToken, cmA) => {
        if (cmA?.address === mockCM1.address) {
          return 1;
        }
        if (cmA?.address === mockCM2.address) {
          return -1;
        }
        return 0;
      },
    );

    const result = sortStrategyCMsByAvailability({
      targetToken: mockToken1,
      allCreditManagers: [mockCM1, mockCM2],
      apyListByNetwork: mockAPYListByNetwork,
      pools: mockPools,
      slippage: 100,
      quotaReserve: 5,
      leverageLimit: 10,
      isStrategy: true,
    })?.[0];

    expect(result).toBe(mockCM2);
  });

  it("should sort by APY when availability is same", () => {
    const mockCM1 = buildCreditManager({
      address: "0x1111",
    });
    const mockCM2 = buildCreditManager({
      address: "0x2222",
    });
    const mockCM3 = buildCreditManager({
      address: "0x333",
    });

    vi.spyOn(
      CmAvailabilityConditionModule,
      "cmAvailabilityCondition",
    ).mockReturnValue(0);
    mockGetStrategyMaxAPY.mockImplementation(
      // eslint-disable-next-line max-nested-callbacks
      (_targetToken, cm) => {
        if (cm?.address === mockCM1.address) {
          return { totalMaxApy: 0.1 } as unknown as ReturnType<
            typeof GetStrategyMaxAPYModule.getStrategyMaxAPY
          >;
        }
        if (cm?.address === mockCM2.address) {
          return { totalMaxApy: 0.5 } as unknown as ReturnType<
            typeof GetStrategyMaxAPYModule.getStrategyMaxAPY
          >;
        }
        if (cm?.address === mockCM3.address) {
          return { totalMaxApy: 0.2 } as unknown as ReturnType<
            typeof GetStrategyMaxAPYModule.getStrategyMaxAPY
          >;
        }
      },
    );

    const result = sortStrategyCMsByAvailability({
      targetToken: mockToken1,
      allCreditManagers: [mockCM1, mockCM2, mockCM3],
      apyListByNetwork: mockAPYListByNetwork,
      pools: mockPools,
      slippage: 100,
      quotaReserve: 5,
      leverageLimit: 10,
      isStrategy: true,
    })?.[0];

    expect(result).toBe(mockCM2); // Higher APY should be preferred
  });

  it("should handle undefined APY values", () => {
    const mockCM1 = buildCreditManager({
      address: "0x1111",
    });
    const mockCM2 = buildCreditManager({
      address: "0x2222",
    });
    const mockCM3 = buildCreditManager({
      address: "0x333",
    });

    vi.spyOn(
      CmAvailabilityConditionModule,
      "cmAvailabilityCondition",
    ).mockReturnValue(0);
    mockGetStrategyMaxAPY.mockImplementation(
      // eslint-disable-next-line max-nested-callbacks
      (_targetToken, cm) => {
        if (cm?.address === mockCM1.address) {
          return undefined;
        }
        if (cm?.address === mockCM2.address) {
          return undefined;
        }
        if (cm?.address === mockCM3.address) {
          return { totalMaxApy: 0.00001 } as unknown as ReturnType<
            typeof GetStrategyMaxAPYModule.getStrategyMaxAPY
          >;
        }
      },
    );

    const result = sortStrategyCMsByAvailability({
      targetToken: mockToken1,
      allCreditManagers: [mockCM1, mockCM2, mockCM3],
      apyListByNetwork: mockAPYListByNetwork,
      pools: mockPools,
      slippage: 100,
      quotaReserve: 5,
      leverageLimit: 10,
      isStrategy: true,
    })?.[0];

    expect(result).toBe(mockCM3); // Higher APY should be preferred
  });

  it("sorts by lower borrow rate when not strategy", () => {
    const mockCM1 = buildCreditManager({
      address: "0x1111",
    });
    const mockCM2 = buildCreditManager({
      address: "0x2222",
    });

    vi.spyOn(
      CmAvailabilityConditionModule,
      "cmAvailabilityCondition",
    ).mockReturnValue(0);
    mockGetStrategyMaxAPY.mockImplementation(
      // eslint-disable-next-line max-nested-callbacks
      (_targetToken, cm) => {
        if (cm?.address === mockCM1.address) {
          return { totalBorrowRate: 20 } as unknown as ReturnType<
            typeof GetStrategyMaxAPYModule.getStrategyMaxAPY
          >;
        }
        if (cm?.address === mockCM2.address) {
          return { totalBorrowRate: 10 } as unknown as ReturnType<
            typeof GetStrategyMaxAPYModule.getStrategyMaxAPY
          >;
        }
      },
    );

    const [first] = sortStrategyCMsByAvailability({
      targetToken: mockToken1,
      allCreditManagers: [mockCM1, mockCM2],
      apyListByNetwork: mockAPYListByNetwork,
      pools: mockPools,
      slippage: 100,
      quotaReserve: 5,
      leverageLimit: 10,
      isStrategy: false,
    });

    expect(first).toBe(mockCM2); // lower borrow rate preferred
  });

  it("falls back to amount comparator when availability and rates tie", () => {
    const mockCM1 = buildCreditManager({
      address: "0x1111",
      maxDebt: 1_000n,
    });
    const mockCM2 = buildCreditManager({
      address: "0x2222",
      maxDebt: 2_000n,
    });

    vi.spyOn(
      CmAvailabilityConditionModule,
      "cmAvailabilityCondition",
    ).mockReturnValue(0);
    mockGetStrategyMaxAPY.mockReturnValue({
      totalBorrowRate: 0,
      totalMaxApy: 0,
    } as unknown as ReturnType<
      typeof GetStrategyMaxAPYModule.getStrategyMaxAPY
    >);
    vi.mocked(amountAbcComparator).mockReturnValue(-1);

    const [first] = sortStrategyCMsByAvailability({
      targetToken: mockToken1,
      allCreditManagers: [mockCM1, mockCM2],
      apyListByNetwork: mockAPYListByNetwork,
      pools: mockPools,
      slippage: 100,
      quotaReserve: 5,
      leverageLimit: 10,
      isStrategy: true,
    });

    expect(first).toBe(mockCM2);
  });
});
