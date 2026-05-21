import type { Address } from "viem";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TokenData } from "../../../charts/token-data.js";
import {
  mockNativeTokenAddress,
  mockToken1,
  mockWrappedNativeTokenAddress,
} from "../../../test-utils/index.js";
import { sortBalances } from "../../creditAccount/sort.js";
import { getWalletBalancesAllowedOnCM } from "./get-wallet-balances-allowed-on-cm.js";

vi.mock("../../utils/creditAccount/sort.js", async () => {
  const actual = await vi.importActual<Record<string, unknown>>(
    "../../utils/creditAccount/sort.js",
  );

  return {
    ...actual,
    sortBalances: vi.fn(),
  };
});

const mockSortBalances = vi.mocked(sortBalances);

describe("getWalletBalancesAllowedOnCM", () => {
  const allowed = mockToken1;
  const prices = {};

  const tokensList: Record<Address, TokenData> = {
    [mockNativeTokenAddress]: new TokenData({
      addr: mockNativeTokenAddress,
      symbol: "ETH",
      name: "Native",
      decimals: 18,
      isPhantom: false,
    }),
    [mockWrappedNativeTokenAddress]: new TokenData({
      addr: mockWrappedNativeTokenAddress,
      symbol: "WETH",
      name: "Wrapped",
      decimals: 18,
      isPhantom: false,
    }),
    [allowed]: new TokenData({
      addr: allowed,
      symbol: "DAI",
      name: "Allowed",
      decimals: 18,
      isPhantom: false,
    }),
  };

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("wraps native token when allowed and keeps sorted balances", () => {
    const collateralRecord = {
      [mockWrappedNativeTokenAddress]: mockWrappedNativeTokenAddress,
      [allowed]: allowed,
    };

    mockSortBalances.mockReturnValue([
      [mockNativeTokenAddress, 2n],
      [allowed, 1n],
    ]);

    const result = getWalletBalancesAllowedOnCM({
      walletBalances: {
        [mockNativeTokenAddress]: 2n,
        [allowed]: 1n,
      },
      collateralRecord,
      nativeTokenAddress: mockNativeTokenAddress,
      wrappedNativeTokenAddress: mockWrappedNativeTokenAddress,
      prices,
      tokensList,
    });

    expect(result).toEqual([
      { token: mockNativeTokenAddress, balance: 2n },
      { token: allowed, balance: 1n },
    ]);
  });

  it("skips native token when paused and fills missing collaterals with zero", () => {
    const collateralRecord = {
      [mockWrappedNativeTokenAddress]: mockWrappedNativeTokenAddress,
      [allowed]: allowed,
      [mockNativeTokenAddress]: mockNativeTokenAddress,
    };

    mockSortBalances.mockReturnValue([[mockNativeTokenAddress, 5n]]);

    const result = getWalletBalancesAllowedOnCM({
      walletBalances: { [mockNativeTokenAddress]: 5n },
      collateralRecord,
      nativeTokenAddress: mockNativeTokenAddress,
      wrappedNativeTokenAddress: mockWrappedNativeTokenAddress,
      prices,
      tokensList,
      isPaused: true,
    });

    expect(result).toEqual([
      { token: mockWrappedNativeTokenAddress, balance: 0n },
      { token: allowed, balance: 0n },
    ]);
  });
});
