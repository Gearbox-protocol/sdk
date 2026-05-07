import type {
  AppChains,
  CuratorFilter,
  GearboxSDKFullStateByChain,
  NotValidatedStrategy,
  StrategyCreditManagerView,
} from "../types.js";
import { createLegacyStrategyDataSource } from "../types.js";
import { getReleasedStrategiesListCore } from "./get-released-strategies-list-core.js";

export function getReleasedStrategiesList<CM extends StrategyCreditManagerView>(
  strategyPayloadsList: NotValidatedStrategy[] | undefined,
  allowedChains: AppChains | undefined,

  sdkStateByChain: GearboxSDKFullStateByChain<CM> | undefined,
  curatorFilter: CuratorFilter,
  showHiddenStrategies: boolean,
) {
  return getReleasedStrategiesListCore({
    strategyPayloadsList,
    allowedChains,
    source: createLegacyStrategyDataSource(sdkStateByChain),
    curatorFilter,
    showHiddenStrategies,
  });
}
