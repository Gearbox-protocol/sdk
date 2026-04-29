import { isAddress, isAddressEqual } from "viem";
import type { Mode } from "../core/index.js";
import type { TokenType } from "../tokens/index.js";

/**
 * Match an underlying token by address, exact symbol, or regex.
 *
 * When `query` is a string, a checksummed 0x-address comparison is attempted
 * first; a non-address string falls back to exact symbol match.
 */
export function matchUnderlying<M extends Mode>(
  token: TokenType<M>,
  query: string | RegExp,
): boolean {
  if (typeof query !== "string") {
    return query.test(token.symbol);
  }
  if (isAddress(query)) {
    return isAddressEqual(token.address, query);
  }
  return token.symbol === query;
}
