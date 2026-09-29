import type { AddAdminAction } from "./configurator-add-admin.js";
import type { RemoveAdminAction } from "./configurator-remove-admin.js";
import type { SetEmergencyAdminAction } from "./configurator-set-emergency-admin.js";
import type { CancelConfigureAction } from "./treasury-cancel-configure.js";
import type { SetDefaultSplitAction } from "./treasury-set-default-split.js";

export type ConfiguratorActions =
  | AddAdminAction
  | RemoveAdminAction
  | SetEmergencyAdminAction
  | SetDefaultSplitAction
  | CancelConfigureAction;

export type ConfiguratorActionType = ConfiguratorActions["type"];
