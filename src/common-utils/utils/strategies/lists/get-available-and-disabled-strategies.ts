import type {
  CuratorFilter,
  StrategiesCMListByChain,
  Strategy,
  StrategyCreditManagerView,
} from "../types.js";

import { getAvailableStrategies } from "./get-available-strategies.js";
import { getDisabledStrategies } from "./get-disabled-strategies.js";

export function getAvailableAndDisabledStrategies<
  CM extends StrategyCreditManagerView,
>(
  list: Strategy[] | undefined | undefined,
  listCMs: StrategiesCMListByChain<CM> | undefined,
  curatorFilter: CuratorFilter | undefined,
) {
  const available = getAvailableStrategies(list, listCMs);
  const disabled = getDisabledStrategies(list, listCMs, curatorFilter);

  return {
    available: available.record,
    disabled: disabled.record,

    availableList: available.list,
    disabledList: disabled.list,
  };
}
