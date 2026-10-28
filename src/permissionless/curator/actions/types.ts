/**
 * The market action union.
 *
 * It is derived from the registry in `marketActionDefinitions.ts`, so registering a
 * definition there is all it takes for an action type to exist.
 **/
import type { AdapterActionContext } from "../plugins/adapters/adapterMarketActionsData.js";
import type { BaseMarketAction } from "./actionTypes.js";
import type { ActionOf } from "./defineMarketAction.js";
import type { marketActionDefinitions } from "./marketActionDefinitions.js";

/** Definition of any registered market action type. **/
export type RegisteredMarketActionDefinition =
  (typeof marketActionDefinitions)[number];

/** Every registered market action. **/
export type MarketActions = ActionOf<RegisteredMarketActionDefinition>;

export type MarketActionType = MarketActions["type"];

/** The built-in market action of type `T`. **/
export type MarketActionOf<T extends MarketActionType> = Extract<
  MarketActions,
  { type: T }
>;

/**
 * An action of an adapter plugin the package does not ship. Its params are
 * validated at runtime by the plugin registered with the SDK; build it with
 * `createAction` for a compile-time check.
 **/
export type ExternalAdapterAction = BaseMarketAction<
  `ADAPTER::${string}::${string}`,
  AdapterActionContext
>;

/** Any market action: a built-in one or one of a registered adapter plugin. **/
export type GipMarketAction = MarketActions | ExternalAdapterAction;

/**
 * `A` checked as precisely as its type allows: a built-in action type must
 * carry that action's params; any other `ADAPTER::…` type is external.
 **/
export type ValidMarketAction<A> = A extends { type: infer T }
  ? T extends MarketActionType
    ? MarketActionOf<T>
    : ExternalAdapterAction
  : never;
