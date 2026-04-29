export type Address = `0x${string}`;
export type Hex = `0x${string}`;

export type NetworkType =
  | "Mainnet"
  | "Arbitrum"
  | "Optimism"
  | "Base"
  | "Sonic"
  | "Monad"
  | "Berachain";

export interface RawTx {
  to: Address;
  callData: Hex;
  value: string;
  description?: string;
}

export interface TvlChartPoint {
  timestamp: number;
  tvl: number;
}

export type TvlChartData = TvlChartPoint[];
