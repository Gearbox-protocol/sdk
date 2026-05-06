import type { Address } from "viem";

import type { PartialRecord } from "../../../../sdk/index.js";

import type { CreditManagerDataSlice } from "./credit-manager-data-legacy.js";
import type { Strategy } from "./strategy.js";

export type StrategiesCMListByChain<CM extends CreditManagerDataSlice> = Record<
  number,
  PartialRecord<Strategy["id"], Record<Address, CM>>
>;
