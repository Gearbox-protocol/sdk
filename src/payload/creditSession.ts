import { BigNumberish } from "ethers";

export interface CreditSessionBalancePayload {
  BI: string;
  F: number;
  ind: number;
  isAllowed: boolean;
  isEnabled: boolean;
}

interface CreditSessionReward {
  bi: BigNumberish;
  f: number;
  pool: string;
  symbol: string;
}

export interface CreditSessionPayload {
  id: string;
  status: number;
  borrower: string;
  account: string;
  creditManager: string;
  underlyingToken: string;
  version: number;

  borrowAPY_RAY: BigNumberish;
  borrowAPY7DAverage: number;

  entryPrice?: number;
  closePrice?: number;
  quoteToken?: string;
  tradingToken?: string;

  healthFactor: BigNumberish;
  leverage: number;
  tfIndex: number;

  initialAmount: BigNumberish;
  collateralInUSD: number;
  collateralInUnderlying: number;
  spotUserFunds: BigNumberish;

  debt: BigNumberish;
  debtUSD: number;

  borrowedAmount: BigNumberish;
  spotDebt: BigNumberish;

  totalValue: BigNumberish;
  totalValueUSD: number;
  spotTotalValue: BigNumberish;

  since: number;
  sinceTimestamp: number;
  closedAt: number;
  closedAtTimestamp: number;

  profitInUSD: number;
  profitInUnderlying: number;

  apy: number;
  roi: number;

  currentBlock: number;
  currentTimestamp: number;

  cvxUnclaimedRewards: Record<string, CreditSessionReward>;
  balances: Record<string, CreditSessionBalancePayload>;
}

export interface CreditSessionFilteredPayload {
  balances: Record<string, CreditSessionBalancePayload>;

  id: string;
  borrower: string;
  account: string;
  creditManager: string;
  underlyingToken: string;

  status: number;
  closedAt: number;
  since: number;
  healthFactor: BigNumberish;
  leverage: number;

  debt: BigNumberish;
  debtUSD: number;
  totalValue: BigNumberish;
  totalValueUSD: number;

  pnl: number;
  pnlUSD: number;

  tfIndex: number;
}

export interface CreditSessionsAggregatedStatsPayload {
  healthFactor: BigNumberish;
  healthFactorOld: BigNumberish;
  healthFactor10kBasis: number;

  leverage: number;
  leverageOld: number;
  leverage10kBasis: number;

  activeAccounts: number;
  activeAccountsOld: number;
  activeAccounts10kBasis: number;

  openedAccounts: number;
  openedAccountsOld: number;
  openedAccounts10kBasis: number;
}

export interface UserCreditSessionsAggregatedStatsPayload {
  totalValue7DInUSD: number;
  totalValue10kBasis: number;
  totalValueInUSD: number;
  accounts: Array<CreditSessionPayload>;
}
