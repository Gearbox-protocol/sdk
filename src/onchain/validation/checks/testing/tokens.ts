import type { Address } from "viem";
import type { Token } from "../../../../model/index.js";

/** The addresses and tokens the check tests weigh things in. */
export const CM = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as Address;
export const POOL = "0xcccccccccccccccccccccccccccccccccccccccc" as Address;

export function token(address: string, symbol = "TKN"): Token {
  return {
    chainId: 1,
    address: address as Address,
    symbol,
    name: symbol,
    decimals: 18,
  };
}

export const UND = token("0x9999999999999999999999999999999999999999", "UND");
export const TOK = token("0x1111111111111111111111111111111111111111");
