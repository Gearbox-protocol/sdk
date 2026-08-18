import type { Address } from "viem";
import type { Asset } from "../../base/index.js";

/**
 * The one input every position-metric function takes: a credit account's
 * state — its credit manager, token balances, quota holdings, debt and total
 * value in the market's underlying — actual or projected.
 *
 * Everything else (decimals, prices, liquidation thresholds, quota rates,
 * the pool's base rate) is read from the market at the calculation site.
 **/
export interface AccountSnapshot {
  /**
   * Credit manager the account is (or will be) opened in.
   **/
  creditManager: Address;
  /**
   * Token balances of the account.
   **/
  assets: Asset[];
  /**
   * Quota holdings of the account: quota balances are denominated in the
   * market's underlying.
   **/
  quotas: Asset[];
  /**
   * Debt principal plus accrued interest and fees, in underlying.
   **/
  debt: bigint;
  /**
   * Total account value in underlying.
   **/
  totalValue: bigint;
}
