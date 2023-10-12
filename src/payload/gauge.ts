import { ExcludeArrayProps } from "@gearbox-protocol/sdk-gov";

import {
  GaugeInfoStructOutput,
  GaugeQuotaParamsStructOutput,
} from "../types/IDataCompressorV3_00";
import { BigintifyProps } from "../utils/types";

export type GaugeQuotaParams = BigintifyProps<
  ExcludeArrayProps<GaugeQuotaParamsStructOutput>
>;

export type GaugeDataPayload = ExcludeArrayProps<GaugeInfoStructOutput>;
