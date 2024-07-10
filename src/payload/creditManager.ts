import { Address } from "viem";

import { BigNumberish } from "../utils/formatter";
import { PoolDataPayload } from "./pool";

export interface CreditManagerDebtParamsSDK {
  creditManager: Address;
  borrowed: bigint;
  limit: bigint;
  availableToBorrow: bigint;
}

export interface QuotaInfo {
  token: Address;
  rate: bigint;
  quotaIncreaseFee: bigint;
  totalQuoted: bigint;
  limit: bigint;
  isActive: boolean;
}

export interface CreditManagerDataPayload {
  addr: Address;
  name: string;
  cfVersion: bigint;
  creditFacade: Address;
  creditConfigurator: Address;
  underlying: Address;
  pool: Address;
  totalDebt: bigint;
  totalDebtLimit: bigint;
  baseBorrowRate: bigint;
  minDebt: bigint;
  maxDebt: bigint;
  availableToBorrow: bigint;
  isDegenMode: boolean;
  degenNFT: Address;
  forbiddenTokenMask: bigint;
  isPaused: boolean;

  collateralTokens: readonly Address[];

  adapters: readonly { targetContract: Address; adapter: Address }[];

  liquidationThresholds: readonly bigint[];

  maxEnabledTokensLength: number;
  feeInterest: number;
  feeLiquidation: number;
  liquidationDiscount: number;
  feeLiquidationExpired: number;
  liquidationDiscountExpired: number;

  quotas: PoolDataPayload["quotas"];
  lirm: PoolDataPayload["lirm"];
}

export interface ChartsCreditManagerPayload {
  addr: string;
  underlyingToken: string;
  configurator: string;
  creditFacade: string;

  isWeth: boolean;
  poolAddress: string;
  name: string;

  maxAmount: BigNumberish;
  minAmount: BigNumberish;
  maxLeverageFactor: number;
  version: number;

  feeInterest: number;
  feeLiquidation: number;
  feeLiquidationExpired: number;
  liquidationPremium: number;
  liquidationPremiumExpired: number;

  borrowRate: BigNumberish;
  borrowRateOld: BigNumberish;
  borrowRate10kBasis: number;

  availableLiquidity: BigNumberish;
  availableLiquidityInUSD: number;

  totalBorrowed: BigNumberish;
  totalBorrowedInUSD: number;
  totalBorrowedBIOld: BigNumberish;
  totalBorrowedBI10kBasis: number;

  totalProfit: BigNumberish;
  totalProfitInUSD: number;
  totalProfitOld: BigNumberish;
  pnl10kBasis: number;

  totalRepaid: BigNumberish;
  totalRepaidInUSD: number;

  totalLosses: BigNumberish;
  totalLossesOld: BigNumberish;
  totalLossesInUSD: number;

  totalOpenedAccounts: number;
  totalOpenedAccountsChange: number;

  openedAccountsCount: number;
  openedAccountsCountChange: number;

  totalLiquidatedAccounts: number;
  totalLiquidatedAccountsChange: number;

  totalClosedAccounts: number;
  totalClosedAccountsChange: number;

  totalRepaidAccounts: number;
  liquidityThresholds: Record<string, number>;

  totalDebtLimit: BigNumberish;
}
