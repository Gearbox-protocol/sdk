import { Address } from "viem";

export interface CaTokenBalance {
  token: Address;
  balance: bigint;
  isForbidden: boolean;
  isEnabled: boolean;
  isQuoted: boolean;
  quota: bigint;
  quotaRate: bigint;
}

export interface CreditAccountDataPayload {
  isSuccessful: boolean;
  priceFeedsNeeded: readonly Address[];
  addr: Address;
  borrower: Address;
  creditManager: Address;
  creditFacade: Address;
  underlying: Address;
  debt: bigint;
  accruedInterest: bigint;
  accruedFees: bigint;
  totalDebtUSD: bigint;
  totalValue: bigint;
  totalValueUSD: bigint;
  twvUSD: bigint;
  enabledTokensMask: bigint;
  healthFactor: bigint;
  baseBorrowRate: bigint;
  balances: readonly {
    token: Address;
    balance: bigint;
    isForbidden: boolean;
    isEnabled: boolean;
    isQuoted: boolean;
    quota: bigint;
    quotaRate: number;
  }[];
  cfVersion: bigint;
  expirationDate: number;
  activeBots: readonly Address[];
}
