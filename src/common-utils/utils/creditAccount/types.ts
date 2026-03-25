import type { Address } from "viem";
import type { Asset } from "../../../sdk/index.js";

export interface TokenDataSlice {
  symbol: string;
  decimals: number;
}

// interface QuotaInfo {
//   token: Address;
//   rate: bigint;
//   quotaIncreaseFee: bigint;
//   totalQuoted: bigint;
//   limit: bigint;
//   isActive: boolean;
// }

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
