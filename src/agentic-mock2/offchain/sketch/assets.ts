import type { Address } from "viem";

export interface AssetRef {
  type: "stable" | "base" | "yield";
  ticker: string;
  price: number;
}

export interface TokenRef extends AssetRef {
  chainId: number;
  address: Address;
  symbol: string;
  decimals: number;
  // isPhantom: boolean;
}
