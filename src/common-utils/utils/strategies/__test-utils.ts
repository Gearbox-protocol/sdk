import type { Address } from "viem";

import type {
  CreditManagerSlice,
  PoolSlice,
  QuotaSlice,
  TokenSlice,
} from "./strategy-info/types.js";

export const mockToken1 =
  "0x1111111111111111111111111111111111111111" as Address;
export const mockToken2 =
  "0x2222222222222222222222222222222222222222" as Address;
export const mockUnderlyingToken =
  "0x9999999999999999999999999999999999999999" as Address;

export const mockTokenData: Record<Address, TokenSlice> = {
  [mockToken1]: { address: mockToken1, decimals: 18, title: "T1" },
  [mockToken2]: { address: mockToken2, decimals: 18, title: "T2" },
  [mockUnderlyingToken]: {
    address: mockUnderlyingToken,
    decimals: 18,
    title: "UNDER",
  },
};

export function buildQuota(
  overrides: Partial<QuotaSlice> & { token: Address },
): QuotaSlice {
  return {
    token: overrides.token,
    rate: 0n,
    quotaIncreaseFee: 0n,
    totalQuoted: 0n,
    limit: 0n,
    isActive: true,
    ...overrides,
  };
}

export function buildPool(overrides: Partial<PoolSlice> = {}): PoolSlice {
  const address = (overrides.address ??
    ("0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as Address)) as Address;
  return {
    address,
    totalDebtLimit: 0n,
    totalBorrowed: 0n,
    ...overrides,
  };
}

export function buildCreditManager(
  overrides: Partial<CreditManagerSlice> = {},
): CreditManagerSlice {
  const address = (overrides.address ??
    ("0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as Address)) as Address;
  const pool = (overrides.pool ??
    ("0xcccccccccccccccccccccccccccccccccccccccc" as Address)) as Address;
  const underlyingToken = (overrides.underlyingToken ??
    mockUnderlyingToken) as Address;
  const quotas = (overrides.quotas ?? {}) as CreditManagerSlice["quotas"];

  return {
    address,
    underlyingToken,
    pool,
    chainId: 1,
    baseBorrowRate: 0,
    feeInterest: 0,
    availableToBorrow: 0n,
    minDebt: 0n,
    maxDebt: 0n,
    totalDebt: 0n,
    totalDebtLimit: 0n,
    isDegenMode: false,
    degenNFT: "0x0000000000000000000000000000000000000000" as Address,
    liquidationThresholds: {},
    quotas,
    collateralTokens: [],
    ...overrides,
  };
}
