import { BigNumberish } from "ethers";

import { CreditManagerDataStructOutput } from "../types/@gearbox-protocol/core-v2/contracts/interfaces/IDataCompressor.sol/IDataCompressor";
import { ExcludeArrayProps } from "../utils/types";

export interface AdapterPayload {
  allowedContract: string;
  adapter: string;
}

export type CreditManagerDataPayload =
  ExcludeArrayProps<CreditManagerDataStructOutput>;

export interface ChartsCreditManagerPayload {
  addr: string;
  underlyingToken: string;
  isWeth: boolean;
  poolAddress: string;

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
}
