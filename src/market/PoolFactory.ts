import type { Address } from "viem";

import type { MarketData } from "../base";
import type { GearboxSDK } from "../GearboxSDK";
import type { PoolFactoryState } from "../state";
import { GaugeContract } from "./GaugeContract";
import { LinearModelContract } from "./LinearModelContract";
import { PoolContract } from "./PoolContract";
import { PoolQuotaKeeperContract } from "./PoolQuotaKeeperContract";

export class PoolFactory {
  public readonly underlying: Address;
  public readonly poolContract: PoolContract;
  public readonly pqkContract: PoolQuotaKeeperContract;
  public readonly gaugeContract: GaugeContract;
  public readonly linearModel: LinearModelContract;

  constructor(data: MarketData, sdk: GearboxSDK) {
    this.underlying = data.pool.underlying as Address;
    this.poolContract = new PoolContract(data.pool, sdk);
    this.pqkContract = new PoolQuotaKeeperContract(
      data.pool,
      data.poolQuotaKeeper,
      sdk,
    );
    this.gaugeContract = new GaugeContract(data.pool, data.rateKeeper, sdk);
    const irModelAddr = data.interestRateModel.baseParams.addr;

    if (sdk.interestRateModels.has(irModelAddr)) {
      // TODO: provide interface when necessary
      this.linearModel = sdk.interestRateModels.mustGet(
        irModelAddr,
      ) as any as LinearModelContract;
    } else {
      const linearModel = new LinearModelContract(data, sdk);
      sdk.interestRateModels.insert(irModelAddr, linearModel as any);
      this.linearModel = linearModel;
    }
  }

  public get state(): PoolFactoryState {
    return {
      pool: this.poolContract.state,
      poolQuotaKeeper: this.pqkContract.state,
      linearModel: this.linearModel.state,
      gauge: this.gaugeContract.state,
    };
  }
}
