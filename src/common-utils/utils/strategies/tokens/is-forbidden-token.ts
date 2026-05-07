import type { Address } from "viem";

import type { StrategyCreditManagerView } from "../types.js";

export function isForbiddenToken({
  address,
  creditManager,
}: {
  address: Address;
  creditManager: Pick<StrategyCreditManagerView, "forbiddenTokens">;
}) {
  return !!creditManager.forbiddenTokens[address];
}
