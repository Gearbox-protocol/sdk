import {BigNumberish} from "ethers";

export interface TokenBalancePayload {
  token: string;
  balance: BigNumberish;
}

export interface CreditAccountDataPayload {
  addr: string;
  borrower: string;
  inUse: boolean;
  creditManager: string;
  kind: string;
  underlyingToken: string;
  borrowedAmountPlusInterest: BigNumberish;
  totalValue: BigNumberish;
  healthFactor: BigNumberish;
  borrowRate: BigNumberish;
  balances: Array<TokenBalancePayload>;
}

export interface CreditAccountDataExtendedPayload extends CreditAccountDataPayload {
  repayAmount: BigNumberish;
  liquidationAmount: BigNumberish;
  borrowedAmount: BigNumberish;
  cumulativeIndexAtOpen: BigNumberish;
  since: BigNumberish;
}
