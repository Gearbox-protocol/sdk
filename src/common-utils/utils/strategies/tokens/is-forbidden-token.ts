import type { Address } from "viem";

import type { CreditManagerData_Legacy } from "../types.js";

export function isForbiddenToken({
  address,
  creditManager,
}: {
  address: Address;
  creditManager: Pick<CreditManagerData_Legacy, "forbiddenTokens">;
}) {
  return !!creditManager.forbiddenTokens[address];
}
