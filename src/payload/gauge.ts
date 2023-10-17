import { AwaitedRes, ExcludeArrayProps } from "@gearbox-protocol/sdk-gov";

import { IGearStakingV3 } from "../types";
import {
  GaugeInfoStructOutput,
  GaugeQuotaParamsStructOutput,
} from "../types/IDataCompressorV3_00";
import { BigintifyProps } from "../utils/types";

export type GaugeQuotaParams = BigintifyProps<
  ExcludeArrayProps<GaugeQuotaParamsStructOutput>
>;

export type GaugeDataPayload = ExcludeArrayProps<GaugeInfoStructOutput>;

export interface GaugeStakingDataPayload {
  availableBalance: AwaitedRes<IGearStakingV3["availableBalance"]>;
  totalBalance: AwaitedRes<IGearStakingV3["balanceOf"]>;
  epoch: AwaitedRes<IGearStakingV3["getCurrentEpoch"]>;
  withdrawableAmounts: AwaitedRes<IGearStakingV3["getWithdrawableAmounts"]>;
}
