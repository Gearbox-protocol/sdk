import { BigNumberish } from "ethers";

export interface CreditSessionBalance {
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

  healthFactor: BigNumberish;
  initialAmount: BigNumberish;
  borrowedAmount: BigNumberish;
  totalValue: BigNumberish;

  since: number;
  sinceTimestamp: number;
  closedAt: number;
  closedAtTimestamp: number;

  collateralInUSD: number;
  collateralInUnderlying: number;
  spotDebt: BigNumberish;
  spotTotalValue: BigNumberish;
  spotUserFunds: BigNumberish;
  profitInUSD: number;
  profitInUnderlying: number;

  apy: number;
  roi: number;

  currentBlock: number;
  currentTimestamp: number;

  cvxUnclaimedRewards: Array<CreditSessionReward>;
  balances: Record<string, CreditSessionBalance>;
}

export interface CreditSessionFilteredPayload {
  balances: Record<string, CreditSessionBalance>;

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
