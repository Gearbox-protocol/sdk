import type { Address } from "viem";
import { isStrategyCMDisabled } from "../strategy-info/is-strategy-cm-disabled.js";

import type { StrategyCreditManagerView } from "../types.js";

const lc = (address: Address): Address => address.toLowerCase() as Address;

export function isStrategyDisabled(
  tokenOutAddress: Address,
  cms: Array<
    Pick<StrategyCreditManagerView, "quotas" | "availableToBorrow" | "minDebt">
  >,
) {
  if (cms.length === 0) return true;

  const targetToken = lc(tokenOutAddress);
  const allCmsUnavailable = cms.every(cm => {
    const quota = cm.quotas[targetToken];
    return isStrategyCMDisabled(cm, quota);
  });

  return allCmsUnavailable;
}
