import type { Address } from "viem";

import type { MarketData } from "../../base/index.js";
import { SDKConstruct } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { PoolSuiteStateHuman } from "../../types/index.js";
import createInterestRateModel from "./createInterestRateModel.js";
import createPool from "./createPool.js";
import createPoolQuotaKeeper from "./createPoolQuotaKeeper.js";
import createRateKeeper from "./createRateKeeper.js";
import { GaugeContract } from "./GaugeContract.js";
import { LinearInterestRateModelContract } from "./LinearInterestRateModelContract.js";
import type {
  IInterestRateModelContract,
  IRateKeeperContract,
  PoolContract,
  PoolQuotaKeeperContract,
} from "./types.js";

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

  public override get watchAddresses(): Set<Address> {
    return new Set([
      this.pool.address,
      this.pqk.address,
      this.rateKeeper.address,
      this.interestRateModel.address,
    ]);
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
