import { BigNumberish } from "ethers";

import { CreditOperation } from "../core/creditOperation";

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
