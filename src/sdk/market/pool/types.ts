import type { IBaseContract } from "../../base";
import type {
  InterestRateModelStateHuman,
  RateKeeperStateHuman,
} from "../../types";
import type { AddressMap } from "../../utils";

export type RateKeeperType = `RATE_KEEPER::${string}`;
export type InterestRateModelType = `IRM::${string}`;

export interface IRateKeeperContract extends IBaseContract {
  readonly rates: AddressMap<number>;

  stateHuman: (raw?: boolean) => RateKeeperStateHuman;
}

export interface IInterestRateModelContract extends IBaseContract {
  stateHuman: (raw?: boolean) => InterestRateModelStateHuman;
}
