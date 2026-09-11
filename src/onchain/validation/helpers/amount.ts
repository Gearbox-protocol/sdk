import type { Token, TokenAmount } from "../../../model/index.js";

/** A check names what a limit was measured in, never what it is worth. */
export function amountOf(token: Token, value: bigint): TokenAmount {
  return { token, value, valueUsd: null };
}
