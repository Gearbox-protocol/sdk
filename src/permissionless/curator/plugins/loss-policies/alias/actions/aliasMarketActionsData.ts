import type { ActionOf } from "../../../../actions/defineMarketAction.js";
import { setAccessModeActionData } from "./setAccessModeActionData.js";
import { setAliasActionData } from "./setAliasActionData.js";
import { setChecksEnabledActionData } from "./setChecksEnabledActionData.js";

export type AliasMarketActions = ActionOf<
  (typeof aliasMarketActionsData)[number]
>;

export const aliasMarketActionsData = [
  setAliasActionData,
  setChecksEnabledActionData,
  setAccessModeActionData,
];
