import { type Address, isAddress, isAddressEqual } from "viem";
import type { Mode } from "../core/index.js";
import type { TokenType } from "../tokens/index.js";
import type { RiskLevel } from "./types.js";

export type TokenLike = Pick<TokenType<Mode>, "address" | "symbol">;
export type TokenQuery = string | Address;

/**
 * Match a token by address, exact symbol, or regex.
 *
 * When `query` is a string, a checksummed 0x-address comparison is attempted
 * first; a non-address string falls back to exact symbol match.
 */
export function matchToken(token: TokenLike, query: string | RegExp): boolean {
  if (typeof query !== "string") {
    return query.test(token.symbol);
  }
  if (isAddress(query)) {
    return isAddressEqual(token.address, query);
  }
  return token.symbol === query;
}

// ---------------------------------------------------------------------------
// Shared predicate factories
// ---------------------------------------------------------------------------

export const byRisk =
  <O extends { risk: { level: RiskLevel } }>(...levels: RiskLevel[]) =>
  (o: O): boolean =>
    levels.length === 0 || levels.includes(o.risk.level);

export const byKyc =
  <O extends { access: { kycRequired: boolean } }>(required: boolean) =>
  (o: O): boolean =>
    o.access.kycRequired === required;

export const byCollaterals =
  <O extends { collaterals: Array<{ token: TokenLike }> }>(
    ...queries: TokenQuery[]
  ) =>
  (o: O): boolean =>
    queries.length === 0 ||
    o.collaterals.some(c => queries.some(q => matchToken(c.token, q)));

// ---------------------------------------------------------------------------
// Strategy-only predicate factories
// ---------------------------------------------------------------------------

export const byTargetCollateral =
  <O extends { targetCollateral: TokenLike }>(query: TokenQuery) =>
  (o: O): boolean =>
    matchToken(o.targetCollateral, query);

export const byDebtOverlap =
  <O extends { minDebt: number; maxDebt: number }>({
    min = 0,
    max = Number.POSITIVE_INFINITY,
  }: {
    min?: number;
    max?: number;
  }) =>
  (o: O): boolean =>
    o.minDebt <= max && o.maxDebt >= min;

export const byNoDelayedWithdrawal =
  <O extends { hasDelayedWithdrawal: boolean }>() =>
  (o: O): boolean =>
    !o.hasDelayedWithdrawal;

export const byMaxLeverage =
  <O extends { maxLeverage: number }>(value: number) =>
  (o: O): boolean =>
    o.maxLeverage <= value;
