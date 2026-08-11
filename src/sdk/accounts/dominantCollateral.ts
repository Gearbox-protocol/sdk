import type { Address } from "viem";
import type { CreditAccountData } from "../base/index.js";
import type { MarketSuite } from "../market/index.js";
import { hexEq } from "../utils/index.js";
import { DUST_THRESHOLD } from "./constants.js";

/**
 * The account's dominant collateral: the most valuable enabled non-underlying
 * token it holds above dust, by USD value.
 *
 * This is the single definition of "what this account is a position in".
 * Using onchain-only data we can only determine at the time of the call (without
 * unreasably difficult calls)
 *
 * @param account - Account to inspect.
 * @param market - Market of the account, whose oracle prices the candidates.
 * @returns The dominant collateral, or `undefined` when the account holds
 * nothing but its underlying, or nothing the oracle can price.
 **/
export function dominantCollateral(
  account: CreditAccountData,
  market: MarketSuite,
): Address | undefined {
  let bestValue = 0;
  let dominant: Address | undefined;
  for (const t of account.tokens) {
    if (
      hexEq(t.token, account.underlying) ||
      (t.mask & account.enabledTokensMask) === 0n ||
      t.balance <= DUST_THRESHOLD
    ) {
      continue;
    }
    // a token the oracle cannot price does not win the comparison
    const value = market.priceOracle.safeUsdValue(t.token, t.balance) ?? 0;
    if (value > bestValue) {
      bestValue = value;
      dominant = t.token;
    }
  }
  return dominant;
}
