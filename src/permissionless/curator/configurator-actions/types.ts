/**
 * The configurator action union, derived from the registry in `configuratorActionDefinitions.ts`.
 **/
import type { ActionOf } from "../actions/defineMarketAction.js";
import type { configuratorActionDefinitions } from "./configuratorActionDefinitions.js";

export type ConfiguratorActions = ActionOf<
  (typeof configuratorActionDefinitions)[number]
>;

export type ConfiguratorActionType = ConfiguratorActions["type"];
