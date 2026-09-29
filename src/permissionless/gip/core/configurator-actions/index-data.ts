import { addAdminActionData } from "./configurator-add-admin.js";
import { removeAdminActionData } from "./configurator-remove-admin.js";
import { setEmergencyAdminActionData } from "./configurator-set-emergency-admin.js";
import type { ConfiguratorActions, ConfiguratorActionType } from "./index.js";
import { cancelConfigureActionData } from "./treasury-cancel-configure.js";
import { setDefaultSplitActionData } from "./treasury-set-default-split.js";
import type { ConfiguratorActionData } from "./types.js";

export const configuratorActionsData = [
  addAdminActionData,
  removeAdminActionData,
  setEmergencyAdminActionData,
  setDefaultSplitActionData,
  cancelConfigureActionData,
];

export const configuratorActionsMap = configuratorActionsData.reduce(
  (acc, action) => {
    acc[action.type] = action as ConfiguratorActionData<ConfiguratorActions>;
    return acc;
  },
  {} as Record<
    ConfiguratorActions["type"],
    ConfiguratorActionData<ConfiguratorActions>
  >,
);

export function validateConfiguratorAction(action: {
  type: string;
  params: unknown;
}): ConfiguratorActions {
  const { type } = action;

  const ConfiguratorActionProcessor =
    configuratorActionsMap[type as ConfiguratorActionType];
  if (!ConfiguratorActionProcessor) {
    throw new Error("Configurator action type not found");
  }

  console.log("ConfiguratorActionProcessor", action.params);

  const schema = ConfiguratorActionProcessor.schema;

  const params = schema.parse(action.params);
  return {
    type,
    params,
  } as ConfiguratorActions;
}

export function configuratorActionsReplace(
  a: ConfiguratorActions,
  b: ConfiguratorActions,
): boolean {
  if (a.type !== b.type) return false;
  const actionData = configuratorActionsMap[a.type];
  return actionData.replace(a.params, b.params);
}
