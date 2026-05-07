import type {
  CuratorFilter,
  GearboxSDKFullStateByChain,
  Strategy,
  StrategyCreditManagerView,
} from "../types.js";
import { createLegacyStrategyDataSource } from "../types.js";

import { getStrategyCreditManagersListCore } from "./get-strategy-credit-managers-list-core.js";

export function getStrategyCreditManagersList<
  CM extends StrategyCreditManagerView,
>(
  strategies: Array<Strategy> | undefined,
  sdkStateByChain: GearboxSDKFullStateByChain<CM> | undefined,
  curatorFilter: CuratorFilter,
) {
  if (!sdkStateByChain) return sdkStateByChain;

  return getStrategyCreditManagersListCore({
    strategies,
    source: createLegacyStrategyDataSource(sdkStateByChain),
    curatorFilter,
  });
}
