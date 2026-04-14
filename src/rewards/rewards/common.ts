import type { Address } from "viem";

export interface TokenData {
  address: Address;
  symbol: string;
  decimals: number;
}
