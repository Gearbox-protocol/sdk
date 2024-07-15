import { Address } from "viem";

export interface CaTokenBalance {
  token: Address;
  balance: bigint;
  isForbidden: boolean;
  isEnabled: boolean;
  isQuoted: boolean;
  quota: bigint;
  quotaRate: bigint;
  quotaCumulativeIndexLU: bigint;
}

export interface CreditAccountDataPayload {
  isSuccessful: boolean;
  priceFeedsNeeded: readonly Address[];
  addr: Address;
  borrower: Address;
  creditManager: Address;
  cmName: string;
  creditFacade: Address;
  underlying: Address;
  debt: bigint;
  cumulativeIndexLastUpdate: bigint;
  cumulativeQuotaInterest: bigint;
  accruedInterest: bigint;
  accruedFees: bigint;
  totalDebtUSD: bigint;
  totalValue: bigint;
  totalValueUSD: bigint;
  twvUSD: bigint;
  enabledTokensMask: bigint;
  healthFactor: bigint;
  baseBorrowRate: bigint;
  aggregatedBorrowRate: bigint;
  balances: readonly {
    token: Address;
    balance: bigint;
    isForbidden: boolean;
    isEnabled: boolean;
    isQuoted: boolean;
    quota: bigint;
    quotaRate: number;
    quotaCumulativeIndexLU: bigint;
  }[];
  since: bigint;
  cfVersion: bigint;
  expirationDate: number;
  activeBots: readonly Address[];
}
