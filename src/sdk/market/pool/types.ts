import type { IBaseContract } from "../../base/index.js";
import type {
  InterestRateModelStateHuman,
  RateKeeperStateHuman,
} from "../../types/index.js";
import type { AddressMap } from "../../utils/index.js";
import type { PoolQuotaKeeperV300Contract } from "./PoolQuotaKeeperV300Contract.js";
import type { PoolQuotaKeeperV310Contract } from "./PoolQuotaKeeperV310Contract.js";
import type { PoolV300Contract } from "./PoolV300Contract.js";
import type { PoolV310Contract } from "./PoolV310Contract.js";

export type RateKeeperType = `RATE_KEEPER::${string}`;
export type InterestRateModelType = `IRM::${string}`;

export interface IRateKeeperContract extends IBaseContract {
  readonly rates: AddressMap<number>;

  stateHuman: (raw?: boolean) => RateKeeperStateHuman;
}

export interface IInterestRateModelContract extends IBaseContract {
  stateHuman: (raw?: boolean) => InterestRateModelStateHuman;
}

export type PoolContract = PoolV300Contract | PoolV310Contract;
export type PoolQuotaKeeperContract =
  | PoolQuotaKeeperV300Contract
  | PoolQuotaKeeperV310Contract;
