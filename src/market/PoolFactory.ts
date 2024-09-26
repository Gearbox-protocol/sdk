import type { Address } from "viem";

import type { MarketDataStruct } from "../base";
import type { GearboxSDK } from "../GearboxSDK";
import type { PoolFactoryState, QuotaParams } from "../state";
import { GaugeContract } from "./GaugeContract";
import { LinearModelContract } from "./LinearModelContract";
import { PoolContract } from "./PoolContract";
import { PoolQuotaKeeperContract } from "./PoolQuotaKeeperContract";

export class PoolFactory {
  underlying: Address;
  quotedTokens: Record<Address, QuotaParams> = {};

  poolContract: PoolContract;
  pqkContract: PoolQuotaKeeperContract;
  gaugeContract: GaugeContract;
  // quotaParams: Array<GaugeQuotaParamsStruct>;
  linearModel: LinearModelContract;

  farmingPools: Set<Address> = new Set();

  public get state(): PoolFactoryState {
    return {
      pool: this.poolContract.state,
      poolQuotaKeeper: this.pqkContract.state,
      linearModel: this.linearModel.state,
      gauge: this.gaugeContract.state,
    };
  }

  constructor(data: MarketDataStruct, sdk: GearboxSDK) {
    this.underlying = data.pool.underlying as Address;
    this.poolContract = new PoolContract(data.pool, sdk);
    this.pqkContract = new PoolQuotaKeeperContract(
      data.pool,
      data.poolQuotaKeeper,
      sdk,
    );
    this.gaugeContract = new GaugeContract(data.pool, data.rateKeeper, sdk);
    this.linearModel = LinearModelContract.attachMarket(data, sdk.v3);
    this.quotedTokens = this.pqkContract.state.quotas;
  }
}
