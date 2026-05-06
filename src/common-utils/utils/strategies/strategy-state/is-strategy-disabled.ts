import type { Address } from "viem";
import { isStrategyCMDisabled } from "../strategy-info/is-strategy-cm-disabled.js";

import type { CreditManagerDataSlice } from "../types.js";

export function isStrategyDisabled(
  tokenOutAddress: Address,
  cms: Array<
    Pick<CreditManagerDataSlice, "quotas" | "availableToBorrow" | "minDebt">
  >,
) {
  if (cms.length === 0) return true;

  const allCmsUnavailable = cms.every(cm => {
    const quota = cm.quotas[tokenOutAddress];
    return isStrategyCMDisabled(cm, quota);
  });

  return allCmsUnavailable;
}
