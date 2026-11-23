import { addAdminActionData } from "./addAdminActionData.js";
import { cancelConfigureActionData } from "./cancelConfigureActionData.js";
import { distributeActionData } from "./distributeActionData.js";
import { grantRoleActionData } from "./grantRoleActionData.js";
import { removeAdminActionData } from "./removeAdminActionData.js";
import { revokeRoleActionData } from "./revokeRoleActionData.js";
import { setDefaultSplitActionData } from "./setDefaultSplitActionData.js";
import { setEmergencyAdminActionData } from "./setEmergencyAdminActionData.js";

/** Every configurator action type, in registration order. **/
export const configuratorActionDefinitions = [
  addAdminActionData,
  removeAdminActionData,
  grantRoleActionData,
  revokeRoleActionData,
  setEmergencyAdminActionData,
  setDefaultSplitActionData,
  cancelConfigureActionData,
  distributeActionData,
];
