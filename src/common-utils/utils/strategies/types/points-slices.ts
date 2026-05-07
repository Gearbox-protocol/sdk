import type { Address } from "viem";
import type {
  DebtReward,
  PointsInfo,
  PointsReward,
} from "../../../../rewards/index.js";

export type LocalPointsReward = PointsReward<string>;
export type LocalDebtReward = DebtReward<string>;
export type LocalPointsInfo = PointsInfo<string>;

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
