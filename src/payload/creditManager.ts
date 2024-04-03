import { ExcludeArrayProps } from "@gearbox-protocol/sdk-gov";
import { BigNumberish } from "ethers";

import { ICreditFacadeV2 } from "../types";
import {
  CreditManagerDataStructOutput,
  CreditManagerDebtParamsStructOutput,
  QuotaInfoStructOutput,
} from "../types/IDataCompressorV3";
import { BigintifyProps } from "../utils/types";

export type CreditManagerDebtParamsSDK = BigintifyProps<
  ExcludeArrayProps<CreditManagerDebtParamsStructOutput>
>;

export type QuotaInfo = BigintifyProps<
  ExcludeArrayProps<QuotaInfoStructOutput>
>;

export interface AdapterPayload {
  allowedContract: string;
  adapter: string;
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
