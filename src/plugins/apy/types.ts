import type { Address } from "viem";
import type { StrategyInfoResult } from "../../common-utils/utils/strategies/strategy-info/types.js";
import type {
  CreditManagerDataSlice,
  CuratorFilter,
  NotValidatedStrategy,
  StrategiesCMListByChain,
  Strategy,
  StrategyRecord,
} from "../../common-utils/utils/strategies/types.js";
import type {
  ExternalApy,
  ExtraCollateralAPY,
  GearAPYDetails,
  PointsInfo,
  PoolExtraApy,
  PoolPointsInfo,
} from "../../rewards/apy/index.js";
import type { BaseContractStateHuman, PartialRecord } from "../../sdk/index.js";

export interface Pool7DAgoState {
  pool: Address;
  dieselRate: bigint;
}

export interface Pools7DAgoStateHuman extends BaseContractStateHuman {
  dieselRate: bigint;
}

export interface FarmRewardInfo {
  address: Address;
  symbol: string;
  rewardToken: Address;
  rewardSymbol: string;
  token: Address;
  duration: bigint;
  finished: bigint;
  reward: bigint;
  balance: bigint;
}

export interface NetworkApyData {
  apyList: Record<Address, number> | undefined;
  extraCollateralAPYList:
    | Record<Address, Record<Address, ExtraCollateralAPY>>
    | undefined;
  pointsList: Record<Address, PointsInfo<string>> | undefined;
  extraCollateralPointsList:
    | Record<Address, Record<Address, PointsInfo<string>>>
    | undefined;
  poolRewardsList: Record<Address, Array<PoolPointsInfo<string>>> | undefined;
  tokenExtraRewardsList: Record<Address, Array<FarmRewardInfo>> | undefined;
  poolExternalAPYList: Record<Address, Array<ExternalApy>> | undefined;
  poolExtraAPYList: Record<Address, Array<PoolExtraApy>> | undefined;
}

export type GearStats = Omit<GearAPYDetails, "lastUpdated">;

export interface ApySnapshotState {
  apy: NetworkApyData;
  gearStats: GearStats | null;
  timestamp: string;
}

export interface GetStrategyInfoSnapshotArgs {
  slippage: number;
  quotaReserve: number;
  curatorFilter: CuratorFilter;
  strategyPayloadsList: NotValidatedStrategy[] | undefined;
  showHiddenStrategies: boolean;
}

export interface StrategyInfoSnapshot<
  CM extends CreditManagerDataSlice = CreditManagerDataSlice,
> {
  availableStrategies: StrategyRecord | null | Error;
  disabledStrategies: StrategyRecord;
  availableList: Strategy[] | null | Error;
  disabledList: Strategy[] | null | Error;
  cmsOfStrategiesByChain: StrategiesCMListByChain<CM> | undefined;
  strategiesInfo: Record<
    number,
    PartialRecord<Strategy["id"], StrategyInfoResult<CM>>
  >;
}
