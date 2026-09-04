import type { Address } from "viem";
import { getAddress } from "viem";
import type { Token } from "../../../model/index.js";
import { NATIVE_ADDRESS } from "../../constants/index.js";

/** The addresses and tokens the check tests weigh things in. */
export const CM = "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" as Address;
export const POOL = "0xcccccccccccccccccccccccccccccccccccccccc" as Address;
export const OWNER = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" as Address;
export const SPENDER = "0xdddddddddddddddddddddddddddddddddddddddd" as Address;

export function token(address: string, symbol = "TKN"): Token {
  return {
    chainId: 1,
    address: getAddress(address),
    symbol,
    name: symbol,
    decimals: 18,
  };
}

export const UND = token("0x9999999999999999999999999999999999999999", "UND");
export const TOK = token("0x1111111111111111111111111111111111111111");
export const WETH = token("0xc02aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "WETH");
export const CBETH = token(
  "0xbe989aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "cbETH",
);
export const NATIVE = token(NATIVE_ADDRESS, "ETH");
