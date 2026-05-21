import type { Address } from "viem";

import { TokenData } from "../charts/token-data.js";
import type {
  CreditManagerSlice,
  PoolSlice,
} from "../utils/strategies/strategy-info/types.js";

export const mockToken1 =
  "0x1111111111111111111111111111111111111111" as Address;
export const mockToken2 =
  "0x2222222222222222222222222222222222222222" as Address;
export const mockUnderlyingToken =
  "0x9999999999999999999999999999999999999999" as Address;

export const mockNativeTokenAddress =
  "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" as Address;
export const mockWrappedNativeTokenAddress =
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2" as Address;

export const mockCMAddress =
  "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as Address;

export function buildQuota(
  overrides: Record<string, unknown> & { token: Address },
): any {
  return {
    rate: 0n,
    quotaIncreaseFee: 0n,
    totalQuoted: 0n,
    limit: 0n,
    isActive: true,
    ...overrides,
  };
}

export function buildPool(overrides: Record<string, unknown> = {}): any {
  const address = (overrides.address ??
    ("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as Address)) as Address;
  return {
    address,
    expectedLiquidity: 0n,
    availableLiquidity: 0n,
    interestModel: {
      interestModel: "0x0000000000000000000000000000000000000000" as Address,
      U_1: 0n,
      U_2: 0n,
      R_base: 0n,
      R_slope1: 0n,
      R_slope2: 0n,
      R_slope3: 0n,
      version: 0,
      isBorrowingMoreU2Forbidden: false,
    },
    totalDebtLimit: 0n,
    totalBorrowed: 0n,
    ...overrides,
  };
}

export function buildCreditManager(
  overrides: Record<string, unknown> = {},
): any {
  const address = (overrides.address ??
    ("0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as Address)) as Address;
  const pool = (overrides.pool ??
    ("0xcccccccccccccccccccccccccccccccccccccccc" as Address)) as Address;
  const underlyingToken = (overrides.underlyingToken ??
    mockUnderlyingToken) as Address;
  const quotas = (overrides.quotas ?? {}) as CreditManagerSlice["quotas"];

  return {
    address,
    name: overrides.name ?? "",
    underlyingToken,
    pool,
    isPaused: overrides.isPaused ?? false,
    collateralTokens: overrides.collateralTokens ?? [],
    forbiddenTokens: overrides.forbiddenTokens ?? {},
    supportedTokens: overrides.supportedTokens ?? {},
    quotas,
    liquidationThresholds: overrides.liquidationThresholds ?? {},
    maxDebt: overrides.maxDebt ?? 0n,
    minDebt: overrides.minDebt ?? 0n,
    availableToBorrow: overrides.availableToBorrow ?? 0n,
    totalDebt: overrides.totalDebt ?? 0n,
    totalDebtLimit: overrides.totalDebtLimit ?? -1n,
    feeInterest: overrides.feeInterest ?? 0,
    baseBorrowRate: overrides.baseBorrowRate ?? 0,
    maxEnabledTokensLength: overrides.maxEnabledTokensLength ?? 0,
    chainId: overrides.chainId ?? 1,
    isDegenMode: overrides.isDegenMode ?? false,
    degenNFT:
      overrides.degenNFT ??
      ("0x0000000000000000000000000000000000000000" as Address),
    isQuoted: overrides.isQuoted ?? (() => false),
    isForbidden: overrides.isForbidden ?? (() => false),
    ...overrides,
  };
}

export function buildTokenData(
  address: Address,
  symbol: string,
  decimals = 18,
  isPhantom = false,
): TokenData {
  return new TokenData({
    addr: address,
    symbol,
    name: symbol,
    decimals,
    isPhantom,
  });
}

export const mockTokenData: Record<Address, TokenData> = {
  [mockToken1]: buildTokenData(mockToken1, "T1"),
  [mockToken2]: buildTokenData(mockToken2, "T2"),
  [mockUnderlyingToken]: buildTokenData(mockUnderlyingToken, "UNDER"),
};

export const mockPrices: Record<Address, bigint> = {
  [mockToken1]: 300000000n,
  [mockToken2]: 200000000n,
  [mockUnderlyingToken]: 100000000n,
};
