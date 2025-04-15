import type { PoolState, RateKeeperState } from "../../base/index.js";
import type { GearboxSDK } from "../../GearboxSDK.js";
import { bytes32ToString } from "../../utils/index.js";
import { GaugeContract } from "./GaugeContract.js";
import { TumblerContract } from "./TumblerContract.js";
import type { IRateKeeperContract, RateKeeperType } from "./types.js";

export default function createRateKeeper(
  sdk: GearboxSDK,
  pool: PoolState,
  data: RateKeeperState,
): IRateKeeperContract {
  const rateKeeperType = bytes32ToString(
    data.baseParams.contractType,
  ) as RateKeeperType;

  switch (rateKeeperType) {
    case "RATE_KEEPER::GAUGE":
      return new GaugeContract(sdk, pool, data);
    case "RATE_KEEPER::TUMBLER":
      return new TumblerContract(sdk, pool, data);
    default:
      throw new Error(`Unknown rate keeper type: ${rateKeeperType}`);
  }
}
