import { BigNumberish } from "ethers";

import { CreditOperation } from "../core/creditOperation";

export interface CreditSessionBalance {
  BI: string;
  F: number;
  linked: boolean;
}

export interface CreditSessionPayload {
  id: string;
  status: number;
  name: string;
  background: string;
  borrower: string;
  creditManager: string;
  account: string;
  since: number;
  sinceTimestamp: number;
  closedAt: number;
  closedAtTimestamp: number;
  initialAmount: BigNumberish;
  borrowedAmount: BigNumberish;
  totalValue?: BigNumberish;
  healthFactor?: BigNumberish;
  profit: BigNumberish;
  profitPercentage: number;
  score: number;
  operations: Array<CreditOperation>;
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
  healthFactor: string;
  leverage: number;

  debt: number;
  debtUSD: number;
  totalValue: number;
  totalValueUSD: number;

  pnl: number;
  pnlUSD: number;

  tfIndex: number;
}
