import type { Address } from "viem";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TokenData } from "../../../charts/token-data.js";
import {
  buildCreditManager,
  mockNativeTokenAddress,
  mockToken1,
  mockToken2,
  mockUnderlyingToken,
  mockWrappedNativeTokenAddress,
} from "../../../test-utils/index.js";
import { isCollateralToken } from "../tokens/is-collateral-token.js";
import { getCMAllowedCollaterals } from "./get-cm-allowed-collaterals.js";

vi.mock("./is-collateral-token");

const mockIsCollateralToken = vi.mocked(isCollateralToken);

describe("getCMAllowedCollaterals", () => {
  const underlying = mockUnderlyingToken;
  const allowed = mockToken1;
  const rejected = mockToken2;

  const tokensList: Record<Address, TokenData> = {
    [underlying]: new TokenData({
      addr: underlying,
      symbol: "DAI",
      name: "Underlying",
      decimals: 18,
      isPhantom: false,
    }),
    [allowed]: new TokenData({
      addr: allowed,
      symbol: "USDC",
      name: "Allowed",
      decimals: 6,
      isPhantom: false,
    }),
    [rejected]: new TokenData({
      addr: rejected,
      symbol: "WBTC",
      name: "Rejected",
      decimals: 8,
      isPhantom: false,
    }),
    [mockWrappedNativeTokenAddress]: new TokenData({
      addr: mockWrappedNativeTokenAddress,
      symbol: "WETH",
      name: "WrappedNative",
      decimals: 18,
      isPhantom: false,
    }),
  };

  const baseCm = buildCreditManager({
    address: "0x0000000000000000000000000000000000000CAA",
    underlyingToken: underlying,
    collateralTokens: [
      underlying,
      allowed,
      rejected,
      mockWrappedNativeTokenAddress,
    ],
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it("returns empty record when credit manager missing", () => {
    const result = getCMAllowedCollaterals({
      creditManager: undefined,
      tokensList,
      delayedPhantoms: {},
      nativeTokenAddress: mockNativeTokenAddress,
      wrappedNativeTokenAddress: mockWrappedNativeTokenAddress,
      extraCollaterals: undefined,
    });

    expect(result).toEqual({});
  });

  it("keeps allowed collaterals and mirrors wrapped native to native token", () => {
    mockIsCollateralToken.mockImplementation(
      ({ address }) => address !== rejected,
    );

    const result = getCMAllowedCollaterals({
      creditManager: baseCm,
      tokensList,
      delayedPhantoms: {},
      nativeTokenAddress: mockNativeTokenAddress,
      wrappedNativeTokenAddress: mockWrappedNativeTokenAddress,
      extraCollaterals: undefined,
    });

    expect(result).toEqual({
      [underlying]: underlying,
      [allowed]: allowed,
      [mockWrappedNativeTokenAddress]: mockWrappedNativeTokenAddress,
      [mockNativeTokenAddress]: mockNativeTokenAddress,
    });
  });

  it("does not mirror wrapped native when credit manager is paused", () => {
    mockIsCollateralToken.mockReturnValue(true);

    const pausedCm = buildCreditManager({
      ...baseCm,
      isPaused: true,
    });

    const result = getCMAllowedCollaterals({
      creditManager: pausedCm,
      tokensList,
      delayedPhantoms: {},
      nativeTokenAddress: mockNativeTokenAddress,
      wrappedNativeTokenAddress: mockWrappedNativeTokenAddress,
      extraCollaterals: undefined,
    });

    expect(result).toEqual({
      [underlying]: underlying,
      [allowed]: allowed,
      [rejected]: rejected,
      [mockWrappedNativeTokenAddress]: mockWrappedNativeTokenAddress,
    });
    expect(result[mockNativeTokenAddress]).toBeUndefined();
  });
});
