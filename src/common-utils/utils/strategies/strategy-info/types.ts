import type { Address } from "viem";

import type { PartialRecord } from "../../../../sdk/index.js";
import type { StrategyPointsResult } from "../points/get-strategy-points.js";

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

export interface QuotaSlice {
  token: Address;
  rate: bigint;
  quotaIncreaseFee: bigint;
  totalQuoted: bigint;
  limit: bigint;
  isActive: boolean;
}

export interface CreditManagerSlice {
  address: Address;
  underlyingToken: Address;
  pool: Address;
  chainId: number;
  baseBorrowRate: number;
  feeInterest: number;
  availableToBorrow: bigint;
  minDebt: bigint;
  maxDebt: bigint;
  totalDebt: bigint;
  totalDebtLimit: bigint;
  isDegenMode: boolean;
  degenNFT: Address;
  liquidationThresholds: Record<Address, bigint>;
  quotas: Record<Address, QuotaSlice | undefined>;
  collateralTokens: readonly Address[];
  maxEnabledTokensLength: number;
  name: string;
  isPaused: boolean;
  supportedTokens: Record<Address, true>;
  forbiddenTokens: Record<Address, true>;
  isQuoted(token: Address): boolean;
  isForbidden(token: Address): boolean;
}

export interface PoolSlice {
  address: Address;
  totalDebtLimit: bigint;
  totalBorrowed: bigint;
  expectedLiquidity: bigint;
  availableLiquidity: bigint;
  interestModel: LinearModel;
  underlyingToken?: Address;
  isPaused?: boolean;
}

export interface TokenSlice {
  address: Address;
  decimals: number;
  title?: string;
  symbol: string;
  name?: string;
  isPhantom?: boolean;
}

export interface StrategySlice<ID extends string | number = string> {
  id: ID;
  chainId: number;
  tokenOutAddress: Address;
  maxLeverage?: number;
}

export interface APYListSlice {
  apyList: Record<Address, number> | undefined;
  extraCollateralAPYList:
    | Record<
        Address,
        Record<Address, { type: "relative" | "absolute"; value: number }>
      >
    | undefined;
}

export interface PricesByChainSlice {
  [chainId: number]:
    | { prices?: Record<Address, Record<Address, bigint>> | undefined }
    | undefined;
}

export interface StrategyInfoResult<
  CM extends CreditManagerSlice = CreditManagerSlice,
> {
  maxLeverage: bigint;
  maxAPY: number | undefined;
  bonusAPY: { value: number } | undefined;
  totalBorrowRate: number;
  availableToBorrowMoney: bigint;
  minCreditManager: CM;
  baseQuotaRateWithFee: bigint;
  points?: StrategyPointsResult;
}

export interface GetStrategyInfoArgs<
  ID extends string | number,
  CM extends CreditManagerSlice,
> {
  strategy: StrategySlice<ID>;
  creditManagers:
    | Record<number, PartialRecord<ID, Record<Address, CM>>>
    | undefined;
  sdkStateByChain:
    | Record<
        number,
        | {
            pools?: Record<Address, PoolSlice> | undefined;
            tokens?: {
              tokenDataList?: Record<Address, TokenSlice> | undefined;
            };
          }
        | undefined
      >
    | undefined;
  apyListByNetwork: Record<number, APYListSlice | undefined> | undefined;
  quotaReserve: number;
  slippage: number;
  allPricesByChain: PricesByChainSlice;
}
