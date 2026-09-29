import {
  type SetAccessModeMarketAction,
  setAccessModeActionData,
} from "./set-access-mode-action.js";
import {
  type SetAliasMarketAction,
  setAliasActionData,
} from "./set-alias-action.js";
import {
  type SetChecksEnabledMarketAction,
  setChecksEnabledActionData,
} from "./set-checks-enabled-action.js";

export type AliasMarketActions =
  | SetAliasMarketAction
  | SetAccessModeMarketAction
  | SetChecksEnabledMarketAction;

export const aliasMarketActionsData = [
  setAliasActionData,
  setChecksEnabledActionData,
  setAccessModeActionData,
];
