/**
 * How a configurator action type is declared; the configurator counterpart of
 * `actions/defineMarketAction.ts`, with the same resolve / apply / encode split.
 **/

import type { z } from "zod/v4";
import type { RawTx } from "../../../onchain/index.js";
import type { ActionDiagnostic } from "../actions/actionDiagnostics.js";
import type { ActionEnv } from "../actions/actionTypes.js";
import type { GipBuilderContext } from "../actions/builderContext.js";
import type {
  AnyMarketAction,
  MergePolicy,
} from "../actions/defineMarketAction.js";
import type { ConfiguratorState } from "../state/configurator/types.js";

export interface ConfiguratorActionDefinition<
  A extends AnyMarketAction = AnyMarketAction,
  R = unknown,
> {
  readonly type: A["type"];
  readonly scope: "configurator";
  readonly name?: string;
  readonly description: string;
  /** Validates and normalizes params; its output is the action's params type. **/
  readonly schema: z.ZodType<A["params"]>;

  /** Reads what the action needs from the chain; memoized per params. **/
  resolve?(args: { ctx: GipBuilderContext; params: A["params"] }): Promise<R>;
  /**
   * Whether the action can run on the state before it; an `error` stops the
   * projection there (see `actions/actionDiagnostics.ts`).
   **/
  check?(args: {
    state: ConfiguratorState;
    params: A["params"];
    resolved: R;
    env: ActionEnv;
  }): ActionDiagnostic[];
  /** The state transition: pure and synchronous. **/
  apply(args: {
    state: ConfiguratorState;
    params: A["params"];
    resolved: R;
    env: ActionEnv;
  }): ConfiguratorState;
  /**
   * The payload call: pure and synchronous. It does not see the state, so
   * configurator payloads can be built without projecting one.
   **/
  encode(args: {
    ctx: GipBuilderContext;
    params: A["params"];
    resolved: R;
  }): RawTx;

  /**
   * What the action configures; a later action of the same type with the
   * same key merges into the earlier one. `undefined`: never merges.
   **/
  key(params: A["params"]): string | undefined;
  readonly merge?: MergePolicy<A["params"]>;

  /** Phantom member carrying the action type; never set. **/
  readonly "~action"?: A;
}

export type ConfiguratorScopedDefinition<
  A extends AnyMarketAction,
  R = undefined,
> = ConfiguratorActionDefinition<A, R>;

export type ConfiguratorActionInput<A extends AnyMarketAction, R> = Omit<
  ConfiguratorActionDefinition<A, R>,
  "scope" | "~action"
>;

/**
 * Declares a configurator action type. As with market actions, annotate the
 * constant with its definition type and pass the action type explicitly.
 **/
export function defineConfiguratorAction<
  A extends AnyMarketAction,
  R = undefined,
>(
  definition: ConfiguratorActionInput<A, R>,
): ConfiguratorScopedDefinition<A, R> {
  return { ...definition, scope: "configurator" };
}
