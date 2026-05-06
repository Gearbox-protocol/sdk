import type { Address } from "viem";

import type { PartialRecord } from "../../../../sdk/index.js";
import type { Strategy } from "./strategy.js";
import type { StrategyCreditManagerView } from "./strategy-data-source.js";

export type StrategiesCMListByChain<CM extends StrategyCreditManagerView> =
  Record<number, PartialRecord<Strategy["id"], Record<Address, CM>>>;
