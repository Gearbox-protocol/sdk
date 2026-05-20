import type { Address } from "viem";

import type { IconComposite } from "../../charts/token-data.js";
import type { LocalPointsInfo } from "../../utils/strategies/types/points-slices.js";
export interface TokenData {
  address: Address;
  symbol: string;
  decimals: number;
  name: string;
  title: string;
  icon: string | IconComposite;
  isPhantom: boolean;
}

export interface QuotaInfo {
  token: Address;
  rate: bigint;
  quotaIncreaseFee: bigint;
  totalQuoted: bigint;
  limit: bigint;
  isActive: boolean;
}

export interface LinearModel {
  U_1: bigint;
  U_2: bigint;
  R_base: bigint;
  R_slope1: bigint;
  R_slope2: bigint;
  R_slope3: bigint;
  interestModel: Address;
  version: number;
  isBorrowingMoreU2Forbidden: boolean;
}

export interface PoolData {
  address: Address;
  expectedLiquidity: bigint;
  availableLiquidity: bigint;
  interestModel: LinearModel;
  totalDebtLimit: bigint;
  totalBorrowed: bigint;
  underlyingToken?: Address;
  isPaused?: boolean;
}

export interface CreditManagerData {
  address: Address;
  name: string;
  underlyingToken: Address;
  pool: Address;
  isPaused: boolean;
  collateralTokens: Array<Address>;
  forbiddenTokens: Record<Address, true>;
  supportedTokens: Record<Address, true>;
  quotas: Record<Address, QuotaInfo>;
  liquidationThresholds: Record<Address, bigint>;
  maxDebt: bigint;
  minDebt: bigint;
  availableToBorrow: bigint;
  totalDebt: bigint;
  totalDebtLimit: bigint;
  feeInterest: number;
  baseBorrowRate: number;
  maxEnabledTokensLength: number;
  chainId: number;
  isDegenMode: boolean;
  degenNFT: Address;
  isQuoted(token: Address): boolean;
  isForbidden(token: Address): boolean;
}

export interface PricesRecord {
  [pool: Address]: {
    [token: Address]: bigint;
  };
}

export interface APYList {
  apyList: Record<Address, number> | undefined;
  extraCollateralAPYList:
    | Record<
        Address,
        Record<Address, { type: "relative" | "absolute"; value: number }>
      >
    | undefined;
  pointsList: Record<Address, LocalPointsInfo> | undefined;
  extraCollateralPointsList:
    | Record<Address, Record<Address, LocalPointsInfo>>
    | undefined;
}
