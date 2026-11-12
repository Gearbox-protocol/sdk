import { addAdminActionData } from "./addAdminActionData.js";
import { cancelConfigureActionData } from "./cancelConfigureActionData.js";
import { distributeActionData } from "./distributeActionData.js";
import { removeAdminActionData } from "./removeAdminActionData.js";
import { setDefaultSplitActionData } from "./setDefaultSplitActionData.js";
import { setEmergencyAdminActionData } from "./setEmergencyAdminActionData.js";

/** Every configurator action type, in registration order. **/
export const configuratorActionDefinitions = [
  addAdminActionData,
  removeAdminActionData,
  setEmergencyAdminActionData,
  setDefaultSplitActionData,
  cancelConfigureActionData,
  distributeActionData,
];
