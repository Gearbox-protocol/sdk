import type { Address } from "viem";

import type { CreditAccountData } from "../base/index.js";

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
