import type { Address } from "viem";
import type { Asset } from "../../../sdk/index.js";

export interface TokenDataSlice {
  symbol: string;
  decimals: number;
}

export interface QuotaInfoIsActiveSlice {
  isActive: boolean;
}

export interface QuotaInfoTokenSlice extends QuotaInfoIsActiveSlice {
  token: Address;
}

export interface QuotaInfoSlice extends QuotaInfoIsActiveSlice {
  rate: bigint;
}

export interface AssetWithAmountInTarget extends Asset {
  amountInTarget: bigint;
}
