import type { Address } from "viem";

import type { CreditAccountData } from "../base/index.js";
import type { GearboxSDK } from "../GearboxSDK.js";
import { isDust } from "./isDust.js";

/**
 * Helper function to filter out low-balance assets
 * @param account
 * @returns
 */
export function filterDust(
  account: CreditAccountData,
): Record<Address, bigint> {
  const result: Record<Address, bigint> = {};
  for (const { token, balance } of account.tokens) {
    if (balance > 10n) {
      result[token] = balance;
    }
  }
  return result;
}

export interface FilterDustUSDOptions {
  sdk: GearboxSDK;
  account: CreditAccountData;
  /**
   * Dust threshold in USD, without decimals
   */
  minBalanceUSD?: bigint;
}

export function filterDustUSD(
  opts: FilterDustUSDOptions,
): Record<Address, bigint> {
  const { sdk, account, minBalanceUSD } = opts;
  const result: Record<Address, bigint> = {};
  for (const { token, balance } of account.tokens) {
    if (
      !isDust({
        sdk,
        token,
        balance,
        creditManager: account.creditManager,
        minBalanceUSD,
      })
    ) {
      result[token] = balance;
    }
  }
  return result;
}
