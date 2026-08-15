import type { Address } from "viem";
import type { CreditAccountDataPayload, OnchainSDK } from "../../../index.js";
import type { CreditAccountSlice } from "../types.js";
import { calcBorrowedAmountPlusInterestAndFees } from "./borrowed-amount-plus-interest-and-fees.js";

/**
 * Narrows full account data down to the slice the intent engine operates on.
 *
 * `accountDebt` is the total repayable debt (principal + accrued interest +
 * accrued fees) rather than the principal, because every debt-touching intent
 * settles the full outstanding amount.
 *
 * Addresses are lowercased so that `eq` comparisons and `AddressMap` lookups
 * behave consistently everywhere downstream.
 */
export function toCreditAccountSlice(
  ca: CreditAccountDataPayload,
): CreditAccountSlice {
  return {
    creditAccount: ca.creditAccount.toLowerCase() as Address,
    creditManager: ca.creditManager.toLowerCase() as Address,
    creditFacade: ca.creditFacade.toLowerCase() as Address,
    underlying: ca.underlying.toLowerCase() as Address,
    enabledTokensMask: ca.enabledTokensMask,
    totalDebtUSD: ca.totalDebtUSD,
    accountDebt: calcBorrowedAmountPlusInterestAndFees(ca),
    tokens: ca.tokens.map(t => ({
      ...t,
      token: t.token.toLowerCase() as Address,
    })),
  };
}

/**
 * Reads an account by address and narrows it to {@link CreditAccountSlice}.
 *
 * The shared read model's `StrategyPosition` carries neither `tokens` nor
 * `enabledTokensMask` / `creditFacade` / `totalDebtUSD`, so simulating against
 * an existing position costs one account read.
 *
 * @throws When the account is not found in the connected markets.
 */
export async function fetchCreditAccountSlice(
  sdk: OnchainSDK,
  creditAccount: Address,
): Promise<CreditAccountSlice> {
  const data = await sdk.accounts.getCreditAccountData(creditAccount);
  if (!data) {
    throw new Error(`credit account not found: ${creditAccount}`);
  }
  return toCreditAccountSlice(data);
}
