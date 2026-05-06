import type { Address } from "viem";

import type { StrategyCreditManagerView } from "../types.js";

export function isActivatedToken({
  address,
  creditManager,
}: {
  address: Address;
  creditManager: Pick<
    StrategyCreditManagerView,
    "liquidationThresholds" | "quotas" | "supportedTokens"
  >;
}) {
  const zeroLt = creditManager.liquidationThresholds[address] === 0n;
  const quotaNotActive = creditManager.quotas[address]?.isActive === false;
  const supportedToken = !!creditManager.supportedTokens[address];

  return supportedToken && !zeroLt && !quotaNotActive;
}
