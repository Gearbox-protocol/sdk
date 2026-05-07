import type { Address } from "viem";

export type PointsMultiplier = bigint | "soon";

export interface LocalPointsReward {
  name: string;
  units: string;
  type: string;
  multiplier: PointsMultiplier;
}

export interface LocalDebtReward extends LocalPointsReward {
  cm: Address | "any";
}

export interface LocalPointsInfo {
  symbol: string;
  address: Address;
  rewards?: Array<LocalPointsReward> | undefined;
  debtRewards?: Array<LocalDebtReward> | undefined;
}

export type PointsList = Record<Address, LocalPointsInfo>;
export type BasePointsList = Record<Address, LocalPointsInfo>;
export type ExtraCollateralPointsList = Record<
  Address,
  Record<Address, LocalPointsInfo>
>;

export type APYListByNetwork = Partial<
  Record<
    number,
    | {
        pointsList?: BasePointsList;
        extraCollateralPointsList?: ExtraCollateralPointsList;
      }
    | undefined
  >
>;

export interface StrategyCreditManagerLike {
  address: Address;
  pool?: Address | undefined;
}

export interface StrategyInfoLike {
  maxLeverage?: bigint | undefined;
  minCreditManager?: StrategyCreditManagerLike | undefined;
}
