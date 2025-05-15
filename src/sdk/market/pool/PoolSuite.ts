import type { Address } from "viem";

import type { MarketData } from "../../base/index.js";
import { SDKConstruct } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import type { PoolSuiteStateHuman } from "../../types/index.js";
import type { MarketConfiguratorContract } from "../MarketConfiguratorContract.js";
import createInterestRateModel from "./createInterestRateModel.js";
import createPool from "./createPool.js";
import createPoolQuotaKeeper from "./createPoolQuotaKeeper.js";
import createRateKeeper from "./createRateKeeper.js";
import { GaugeContract } from "./GaugeContract.js";
import { LinearInterestRateModelContract } from "./LinearInterestRateModelContract.js";
import { TumblerContract } from "./TumblerContract.js";
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

  #marketConfigurator: Address;

  constructor(sdk: GearboxSDK, data: MarketData) {
    super(sdk);
    this.pool = createPool(sdk, data.pool);
    this.pqk = createPoolQuotaKeeper(sdk, data.pool, data.quotaKeeper);
    this.rateKeeper = createRateKeeper(sdk, data.pool, data.rateKeeper);
    this.interestRateModel = createInterestRateModel(
      sdk,
      data.interestRateModel,
    );
    this.#marketConfigurator = data.configurator;
  }

  public get gauge(): GaugeContract {
    if (this.rateKeeper instanceof GaugeContract) {
      return this.rateKeeper;
    }
    throw new Error(
      "Rate keeper is not a gauge, but a " + this.rateKeeper.contractType,
    );
  }

  public get tumbler(): TumblerContract {
    if (this.rateKeeper instanceof TumblerContract) {
      return this.rateKeeper;
    }
    throw new Error(
      "Rate keeper is not a tumbler, but a " + this.rateKeeper.contractType,
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

  public get marketConfigurator(): MarketConfiguratorContract {
    return this.sdk.contracts.mustGet(
      this.#marketConfigurator,
    ) as unknown as MarketConfiguratorContract;
  }

  public get underlying(): Address {
    return this.pool.underlying;
  }

  override get dirty(): boolean {
    return (
      this.pool.dirty ||
      this.rateKeeper.dirty ||
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
