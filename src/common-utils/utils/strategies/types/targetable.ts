import type { Address } from "viem";

import type { CreditManagerSlice } from "../strategy-info/types.js";

export type IsTargetableProps = {
  address: Address;
  creditManager: Pick<
    CreditManagerSlice,
    "forbiddenTokens" | "liquidationThresholds" | "quotas" | "supportedTokens"
  >;
};
