import type { MarketActions } from "../actions/index.js";
import {
  marketActionsMap,
  marketActionsReplace,
} from "../actions/index-data.js";
import type { ConfiguratorActions } from "../configurator-actions/index.js";
import {
  configuratorActionsMap,
  configuratorActionsReplace,
} from "../configurator-actions/index-data.js";

export function addOrReplaceAction(
  prevActions: MarketActions[],
  action: MarketActions,
  insertIndex = -1,
): MarketActions[] {
  const index = prevActions.findIndex(candidate =>
    marketActionsReplace(candidate, action),
  );

  if (index === -1) {
    if (insertIndex === -1) return [...prevActions, action];
    return [
      ...prevActions.slice(0, insertIndex),
      action,
      ...prevActions.slice(insertIndex),
    ];
  }

  if (marketActionsMap[action.type].replaceKeep === "last") {
    const idx = insertIndex >= 0 ? Math.max(index, insertIndex) : index;
    return [
      ...prevActions.slice(0, idx),
      ...prevActions.slice(idx + 1),
      action,
    ];
  }

  const idx = insertIndex >= 0 ? Math.min(index, insertIndex) : index;
  return [...prevActions.slice(0, idx), action, ...prevActions.slice(idx + 1)];
}

export function addOrReplaceConfiguratorAction(
  prevActions: ConfiguratorActions[],
  action: ConfiguratorActions,
): ConfiguratorActions[] {
  const index = prevActions.findIndex(candidate =>
    configuratorActionsReplace(candidate, action),
  );
  if (index === -1) return [...prevActions, action];

  if (configuratorActionsMap[action.type].replaceKeep === "last") {
    return [
      ...prevActions.slice(0, index),
      ...prevActions.slice(index + 1),
      action,
    ];
  }

  return [
    ...prevActions.slice(0, index),
    action,
    ...prevActions.slice(index + 1),
  ];
}
