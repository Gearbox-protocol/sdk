import type { Address } from "viem";

import type { CreditManagerData_Legacy } from "./credit-manager-data-legacy.js";

export type IsTargetableProps = {
  address: Address;
  creditManager: Pick<
    CreditManagerData_Legacy,
    "forbiddenTokens" | "liquidationThresholds" | "quotas" | "supportedTokens"
  >;
};
