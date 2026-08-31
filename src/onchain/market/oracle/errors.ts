import type { Address } from "viem";
import type { IGearboxError } from "../../../model/errors.js";

/**
 * The oracle has no price for `token`. Preview callers attach this with
 * `warning ??=` so a malformed-transaction warning already recorded keeps
 * precedence.
 **/
export interface UnpriceableTokenError extends IGearboxError {
  code: "unpriceableToken";
  /** Token the oracle could not price. */
  token: Address;
}

/**
 * Builds an {@link UnpriceableTokenError} for `token`.
 **/
export function unpriceableTokenError(token: Address): UnpriceableTokenError {
  return {
    code: "unpriceableToken",
    message: `cannot price token ${token}`,
    token,
  };
}
