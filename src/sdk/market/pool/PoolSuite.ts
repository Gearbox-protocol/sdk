import type { Address } from "viem";

import type { MarketData } from "../../base";
import { SDKConstruct } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import type { PoolSuiteStateHuman } from "../../types";
import createInterestRateModel from "./createInterestRateModel";
import createPool from "./createPool";
import createPoolQuotaKeeper from "./createPoolQuotaKeeper";
import createRateKeeper from "./createRateKeeper";
import { GaugeContract } from "./GaugeContract";
import { LinearInterestRateModelContract } from "./LinearInterestRateModelContract";
import type {
  IInterestRateModelContract,
  IRateKeeperContract,
  PoolContract,
  PoolQuotaKeeperContract,
} from "./types";

export class PoolSuite extends SDKConstruct {
  public readonly pool: PoolContract;
  public readonly pqk: PoolQuotaKeeperContract;
  public readonly rateKeeper: IRateKeeperContract;
  public readonly interestRateModel: IInterestRateModelContract;

  constructor(sdk: GearboxSDK, data: MarketData) {
    super(sdk);
    this.pool = createPool(sdk, data.pool);
    this.pqk = createPoolQuotaKeeper(sdk, data.pool, data.poolQuotaKeeper);
    this.rateKeeper = createRateKeeper(sdk, data.pool, data.rateKeeper);
    this.interestRateModel = createInterestRateModel(
      sdk,
      data.interestRateModel,
    );
  }

  public get gauge(): GaugeContract {
    if (this.rateKeeper instanceof GaugeContract) {
      return this.rateKeeper;
    }
    throw new Error(
      "Rate keeper is not a gauge, but a " + this.rateKeeper.contractType,
    );
  }

  public get linearModel(): LinearInterestRateModelContract {
    if (this.interestRateModel instanceof LinearInterestRateModelContract) {
      return this.interestRateModel;
    }
    throw new Error(
      `Interest rate model is not a linear model, but a ${this.interestRateModel.contractType}`,
    );
  }

  public get underlying(): Address {
    return this.pool.underlying;
  }

  override get dirty(): boolean {
    return (
      this.pool.dirty ||
      this.gauge.dirty ||
      this.pqk.dirty ||
      this.interestRateModel.dirty
    );
  }

  public stateHuman(raw = true): PoolSuiteStateHuman {
    return {
      pool: this.pool.stateHuman(raw),
      poolQuotaKeeper: this.pqk.stateHuman(raw),
      interestRateModel: this.interestRateModel.stateHuman(raw),
      rateKeeper: this.rateKeeper.stateHuman(raw),
    };
  }
}
