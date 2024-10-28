import { Address } from "viem";

export interface CaTokenBalance {
  success: boolean;
  token: Address;
  balance: bigint;
  isForbidden: boolean;
  isEnabled: boolean;
  isQuoted: boolean;
  quota: bigint;
  quotaRate: bigint;
  mask: bigint;
}

export interface CreditAccountDataPayload {
  isSuccessful: boolean;
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
    success: boolean;
    token: Address;
    balance: bigint;
    isForbidden: boolean;
    isEnabled: boolean;
    isQuoted: boolean;
    quota: bigint;
    quotaRate: number;
    mask: bigint;
  }[];
  cfVersion: bigint;
  expirationDate: number;
  activeBots: readonly Address[];
}
