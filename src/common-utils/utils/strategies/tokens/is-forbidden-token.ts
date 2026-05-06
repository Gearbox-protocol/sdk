import type { Address } from "viem";

import type { CreditManagerDataSlice } from "../types.js";

export function isForbiddenToken({
  address,
  creditManager,
}: {
  address: Address;
  creditManager: Pick<CreditManagerDataSlice, "forbiddenTokens">;
}) {
  return !!creditManager.forbiddenTokens[address];
}
