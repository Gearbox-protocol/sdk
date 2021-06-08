import { BigNumberish } from "ethers";
import { CreditOperation } from "../core/creditOperation";

export interface CreditSessionPayload {
  status: number;
  name: string;
  borrower: string;
  creditManager: string;
  account: string;
  since: number;
  sinceTimestamp: number;
  closedAt: number;
  closedAtTimestamp: number;
  initialAmount: BigNumberish;
  borrowedAmount: BigNumberish;
  profit: BigNumberish;
  profitPercentage: number;
  score: number;
  operations: Array<CreditOperation>;
}
