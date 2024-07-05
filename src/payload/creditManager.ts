import { Address, ExcludeArrayProps } from "@gearbox-protocol/sdk-gov";
import { BigNumberish } from "ethers";

import { ICreditFacadeV2 } from "../types";
import { CreditManagerDataStructOutput } from "../types/IDataCompressorV3";

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

export interface AdapterPayload {
  allowedContract: Address;
  adapter: Address;
}

export type TotalDebt = ExcludeArrayProps<
  Awaited<ReturnType<ICreditFacadeV2["totalDebt"]>>
>;

export type CreditManagerDataPayload =
  ExcludeArrayProps<CreditManagerDataStructOutput>;

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
