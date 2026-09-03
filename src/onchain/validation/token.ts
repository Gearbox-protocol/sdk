import type { Address } from "viem";
import type { Token, TokenAmount } from "../../model/index.js";
import type { OnchainSDK } from "../OnchainSDK.js";
import { shortAddress } from "../utils/formatter.js";
import { amountOf } from "./helpers/index.js";

/**
 * The token behind an address, for the refusal details that inline one.
 *
 * A token the registry does not know falls back to its own shortened address
 * as a symbol and `decimals: 0` — an unknown token has no scale, and guessing
 * 18 would silently misformat every amount denominated in it.
 */
export function toToken(sdk: OnchainSDK, address: Address): Token {
  const known = sdk.tokensMeta.getToken(address);
  if (known) {
    return known;
  }
  return {
    chainId: sdk.chainId,
    address,
    symbol: shortAddress(address),
    name: "",
    decimals: 0,
  };
}

/** {@link toToken} plus an amount denominated in it. */
export function toTokenAmount(
  sdk: OnchainSDK,
  address: Address,
  value: bigint,
): TokenAmount {
  return amountOf(toToken(sdk, address), value);
}
