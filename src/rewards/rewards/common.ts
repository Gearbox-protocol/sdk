import type { Address } from "viem";

export interface TokenData {
  address: Address;
  symbol: string;
  decimals: number;
}

export interface PoolData {
  address: Address;
  version: number;
  underlyingToken: Address;
  dieselRateRay: bigint;
  dieselToken: Address;
  stakedDieselToken: Address[];
  stakedDieselToken_old: Address[];
  expectedLiquidity: bigint;
}
