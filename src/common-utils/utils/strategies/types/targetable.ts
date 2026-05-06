import type { Address } from "viem";

import type { CreditManagerDataSlice } from "./credit-manager-data-legacy.js";

export type IsTargetableProps = {
  address: Address;
  creditManager: Pick<
    CreditManagerDataSlice,
    "forbiddenTokens" | "liquidationThresholds" | "quotas" | "supportedTokens"
  >;
};
