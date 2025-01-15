import type { Address } from "viem";

import { type MarketData, SDKConstruct } from "../base";
import type { GearboxSDK } from "../GearboxSDK";
import type { PoolSuiteStateHuman } from "../types";
import { GaugeContract } from "./GaugeContract";
import { LinearModelContract } from "./LinearModelContract";
import { PoolContract } from "./PoolContract";
import { PoolQuotaKeeperContract } from "./PoolQuotaKeeperContract";

export class PoolSuite extends SDKConstruct {
  public readonly pool: PoolContract;
  public readonly pqk: PoolQuotaKeeperContract;
  public readonly gauge: GaugeContract;
  public readonly linearModel: LinearModelContract;

  constructor(sdk: GearboxSDK, data: MarketData) {
    super(sdk);
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

  public get underlying(): Address {
    return this.pool.underlying;
  }

  override get dirty(): boolean {
    return (
      this.pool.dirty ||
      this.gauge.dirty ||
      this.pqk.dirty ||
      this.linearModel.dirty
    );
  }

  public stateHuman(raw = true): PoolSuiteStateHuman {
    return {
      pool: this.pool.stateHuman(raw),
      poolQuotaKeeper: this.pqk.stateHuman(raw),
      linearModel: this.linearModel.stateHuman(raw),
      gauge: this.gauge.stateHuman(raw),
    };
  }
}
