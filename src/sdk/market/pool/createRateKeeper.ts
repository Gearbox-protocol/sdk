import type { PoolData, RateKeeperData } from "../../base";
import type { GearboxSDK } from "../../GearboxSDK";
import { bytes32ToString } from "../../utils";
import { GaugeContract } from "./GaugeContract";
import type { IRateKeeperContract, RateKeeperType } from "./types";

export default function createRateKeeper(
  sdk: GearboxSDK,
  pool: PoolData,
  data: RateKeeperData,
): IRateKeeperContract {
  const rateKeeperType = bytes32ToString(
    data.baseParams.contractType,
  ) as RateKeeperType;

  switch (rateKeeperType) {
    case "RATE_KEEPER::GAUGE":
      return new GaugeContract(sdk, pool, data);
    // case "RATE_KEEPER::TUMBLER":
    // return new GaugeV2Contract(sdk, pool, data);
    default:
      throw new Error(`Unknown rate keeper type: ${rateKeeperType}`);
  }
}
