import type { Address } from "viem";
import type { CreditManagerTarget } from "../../actions/creditManagerTargets.js";
import {
  type AdapterMarketActionDefinition,
  builtinAdapterPlugins,
} from "./builtinAdapterPlugins.js";

/** What every adapter action is addressed to. **/
export type AdapterActionContext = {
  creditManager: CreditManagerTarget;
  version: number;
  target: Address;
};

/** Every built-in adapter action, in plugin order. **/
export const adapterMarketActionsData = builtinAdapterPlugins.flatMap(plugin =>
  Object.values(plugin.actions),
) as AdapterMarketActionDefinition[];
