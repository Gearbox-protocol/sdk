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

  availableLiquidity: string;
  borrowRate: string;
  isWeth: boolean;
  maxAmount: string;
  maxLeverageFactor: number;
  minAmount: string;
  openedAccountsCount: number;
  totalBorrowed: string;
  totalClosedAccounts: number;
  totalLiquidatedAccounts: number;
  totalLosses: string;
  totalOpenedAccounts: number;
  totalProfit: string;
  totalRepaid: string;
  totalRepaidAccounts: number;
  poolAddress: string;

  // v1 props
  underlyingToken: string;

  // charts props
  availableLiquidityInUSD: number;
  totalBorrowedInUSD: number;
  totalLossesInUSD: number;
  totalProfitInUSD: number;
  totalRepaidInUSD: number;

  openedAccountsCountChange: number;
  totalOpenedAccountsChange: number;
  totalClosedAccountsChange: number;
  totalLiquidatedAccountsChange: number;

  feeInterest: number;
  feeLiquidation: number;
  feeLiquidationExpired: number;
  liquidationPremium: number;
  liquidationPremiumExpired: number;

  version: number;
}
