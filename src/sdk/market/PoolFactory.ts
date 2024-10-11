import type { Address } from "viem";

import { type MarketData, SDKConstruct } from "../base";
import type { GearboxSDK } from "../GearboxSDK";
import type { PoolFactoryState } from "../state";
import { GaugeContract } from "./GaugeContract";
import { LinearModelContract } from "./LinearModelContract";
import { PoolContract } from "./PoolContract";
import { PoolQuotaKeeperContract } from "./PoolQuotaKeeperContract";

export class PoolFactory extends SDKConstruct {
  public readonly underlying: Address;
  public readonly pool: PoolContract;
  public readonly pqk: PoolQuotaKeeperContract;
  public readonly gauge: GaugeContract;
  public readonly linearModel: LinearModelContract;

  constructor(sdk: GearboxSDK, data: MarketData) {
    super(sdk);
    this.underlying = data.pool.underlying as Address;
    this.pool = new PoolContract(sdk, data.pool);
    this.pqk = new PoolQuotaKeeperContract(
      sdk,
      data.pool,
      data.poolQuotaKeeper,
    );
    this.gauge = new GaugeContract(sdk, data.pool, data.rateKeeper);
    const irModelAddr = data.interestRateModel.baseParams.addr;

    if (sdk.interestRateModels.has(irModelAddr)) {
      // TODO: provide interface when necessary
      this.linearModel = sdk.interestRateModels.mustGet(
        irModelAddr,
      ) as any as LinearModelContract;
    } else {
      const linearModel = new LinearModelContract(sdk, data);
      sdk.interestRateModels.insert(irModelAddr, linearModel as any);
      this.linearModel = linearModel;
    }
  }

  override get dirty(): boolean {
    return (
      this.pool.dirty ||
      this.gauge.dirty ||
      this.pqk.dirty ||
      this.linearModel.dirty
    );
  }

  public get state(): PoolFactoryState {
    return {
      pool: this.pool.state,
      poolQuotaKeeper: this.pqk.state,
      linearModel: this.linearModel.state,
      gauge: this.gauge.state,
    };
  }
}
