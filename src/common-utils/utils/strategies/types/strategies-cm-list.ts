import type { Address } from "viem";

import type { PartialRecord } from "../../../../sdk/index.js";

import type { CreditManagerData_Legacy } from "./credit-manager-data-legacy.js";
import type { Strategy } from "./strategy.js";

export type StrategiesCMListByChain = Record<
  number,
  PartialRecord<Strategy["id"], Record<Address, CreditManagerData_Legacy>>
>;
