import type { Address } from "viem";
import type { Asset, CreditAccountData } from "../../base/index.js";
import { DUST_THRESHOLD } from "../../constants/math.js";

/**
 * The one input every position-metric function takes: a credit account's
 * state — its credit manager, token balances, quota holdings, total debt and
 * total value in the market's underlying — actual or projected.
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
  totalDebt: bigint;
  /**
   * Total account value in underlying.
   **/
  totalValue: bigint;
}

/**
 * Builds an {@link AccountSnapshot} from on-chain credit account data: the
 * enabled, above-dust tokens become assets and quotas, and `totalDebt` is
 * principal plus accrued interest and fees.
 **/
export function accountSnapshotFromCreditAccountData(
  ca: CreditAccountData,
): AccountSnapshot {
  const assets: Asset[] = [];
  const quotas: Asset[] = [];
  for (const t of ca.tokens) {
    if ((t.mask & ca.enabledTokensMask) === 0n || t.balance <= DUST_THRESHOLD) {
      continue;
    }
    assets.push({ token: t.token, balance: t.balance });
    quotas.push({ token: t.token, balance: t.quota });
  }
  return {
    creditManager: ca.creditManager,
    assets,
    quotas,
    totalDebt: ca.debt + ca.accruedInterest + ca.accruedFees,
    totalValue: ca.totalValue,
  };
}
