import type { Address } from "viem";

import type { StrategyCreditManagerView } from "./strategy-data-source.js";

export type IsTargetableProps = {
  address: Address;
  creditManager: Pick<
    StrategyCreditManagerView,
    "forbiddenTokens" | "liquidationThresholds" | "quotas" | "supportedTokens"
  >;
};
