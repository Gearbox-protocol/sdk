import type { Address } from "viem";

import type { CreditManagerSlice } from "../strategy-info/types.js";

export function isForbiddenToken({
  address,
  creditManager,
}: {
  address: Address;
  creditManager: Pick<CreditManagerSlice, "forbiddenTokens">;
}) {
  return !!creditManager.forbiddenTokens[address];
}
