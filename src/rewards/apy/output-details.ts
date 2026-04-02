import type { Address } from "viem";

interface GearAPY {
  base: number;
  crv: number;
  gear: number;
  gearPrice: number;
}

export type GearAPYDetails = GearAPY & { lastUpdated: string };

export interface TokenOutputDetails<T extends string> {
  chainId: number;
  address: string;
  symbol: string;
  rewards: {
    apy: Array<Omit<ApyDetails, "symbol" | "address">>;
    points: Array<Omit<PointsInfo<T>, "symbol" | "address">>;
    extraRewards: Array<Omit<FarmInfo, "symbol" | "address">>;
    extraCollateralAPY: Array<Omit<ExtraCollateralAPY, "symbol" | "address">>;
    extraCollateralPoints: Array<
      Omit<ExtraCollateralPointsInfo<T>, "symbol" | "address">
    >;
  };
}

export type ApyDetails = Apy & { lastUpdated: string };

export interface FarmInfo {
  address: Address;
  symbol: string;

  rewardToken: Address;
  rewardSymbol: string;

  duration: bigint;
  finished: bigint;

  reward: bigint;
  balance: bigint;
}

export interface Apy {
  address: Address;
  symbol: string;
  protocol: string;

  value: number;
}

export interface ExtraCollateralAPY extends Omit<Apy, "protocol"> {
  pool: Address;
  // absolute apy completely replaces apy value of token for given pool
  // relative apy adds to the apy value of token for given pool
  type: "relative" | "absolute";
}

interface PointsReward<T extends string> {
  name: string;
  units: string;
  multiplier: bigint | "soon";
  type: T;
}

interface DebtReward<T extends string> extends PointsReward<T> {
  cm: Address | "any";
}

export interface PointsInfo<T extends string> {
  symbol: string;
  address: Address;
  rewards: Array<PointsReward<T>>;
  debtRewards?: Array<DebtReward<T>>;
}

export interface ExtraCollateralPointsInfo<T extends string>
  extends PointsInfo<T> {
  pool: Address;
}

export interface PoolOutputDetails<T extends string> {
  chainId: number;
  pool: Address;

  rewards: {
    points: Array<Omit<PoolPointsInfo<T>, "pool">>;
    externalAPY: Array<Omit<ExternalApy, "pool">>;
    extraAPY: Array<Omit<PoolExtraApy, "pool">>;
  };
}

export interface PoolPointsInfo<T extends string> {
  pool: Address;
  token: Address;
  symbol: string;

  amount: bigint;
  duration: string | undefined;
  name: string;
  type: T;
  estimation: "absolute" | "relative";
  condition: "deposit" | "cross-chain-deposit" | "holding";
}

export interface ExternalApy {
  value: number;
  name: string;

  pool: Address;
}

export interface PoolExtraApy {
  token: Address;

  apy: number;
  rewardToken: Address;
  rewardTokenSymbol: string;
  endTimestamp?: number;

  lastUpdated: string;
}
