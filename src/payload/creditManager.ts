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

  availableLiquidity: BigNumberish;
  borrowRate: BigNumberish;
  isWeth: boolean;
  maxAmount: BigNumberish;
  maxLeverageFactor: number;
  minAmount: BigNumberish;
  openedAccountsCount: number;
  totalBorrowed: BigNumberish;
  totalClosedAccounts: number;
  totalLiquidatedAccounts: number;
  totalLosses: BigNumberish;
  totalOpenedAccounts: number;
  totalProfit: BigNumberish;
  totalRepaid: stBigNumberishring;
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
