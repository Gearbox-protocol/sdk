/**
 * How an adapter plugin is declared.
 *
 * A plugin is everything the builder knows about one adapter type: how it is
 * deployed by `CREDIT::allowAdapter`, what its state looks like and how that
 * state is read and diffed, and the actions that configure it afterwards.
 * Built-in plugins are listed in `builtinAdapterPlugins.ts`; a plugin defined outside the
 * package has exactly the same shape.
 **/

import type { Abi, Address, Chain, PublicClient, Transport } from "viem";
import type { z } from "zod/v4";
import type { AbstractAdapterContract } from "../../../../onchain/index.js";
import type { MarketActionDefinition } from "../../actions/defineMarketAction.js";
import type { ObjectNode } from "../../state/diff/schemaNodes.js";
import type { MarketState } from "../../state/market/types.js";
import type { DeployParams, MarketStateChanges } from "../../types.js";

/** Deploy params every adapter has: its type, version and target contract. **/
export interface AdapterDeployParamsBase {
  type: string;
  version: number;
  target: Address;
}

/** State every adapter has. `adapter` is zero until the adapter is deployed. **/
export interface AdapterStateBase {
  type: string;
  version: number;
  target: Address;
  adapter: Address;
  isForbidden: boolean;
}

export interface ValidateAdapterParamsArgs<D> {
  client: PublicClient<Transport, Chain>;
  instance: { assets: Array<{ address: Address; symbol: string }> };
  marketChanges: MarketStateChanges;
  creditManager: Address;
  params: D;
  marketConfigurator: Address;
}

/** Read-only inputs used to resolve an adapter's validation dependencies. */
export type ResolveAdapterValidationArgs<D> = Pick<
  ValidateAdapterParamsArgs<D>,
  "client" | "params" | "marketConfigurator"
>;
/** Pure validation against the state immediately preceding allowAdapter. */
export type AdapterValidation = (
  state: MarketState,
  creditManager: Address,
  instance?: ValidateAdapterParamsArgs<unknown>["instance"],
) => false | string;

/** Actions configuring an adapter, by name: `ADAPTER::<type>::<function>`. **/
export type AdapterActions = Readonly<Record<string, MarketActionDefinition>>;

export interface AdapterPluginDefinition<
  D extends AdapterDeployParamsBase = AdapterDeployParamsBase,
  S extends AdapterStateBase = AdapterStateBase,
  X extends AdapterActions = AdapterActions,
> {
  /** Adapter type, as in the contract type `ADAPTER::<type>`. **/
  readonly type: D["type"];
  readonly name: string;
  readonly description: string;
  readonly deprecated?: boolean;
  /** Whether the app offers editing the deploy params. **/
  readonly isEditable: boolean;
  /** Heuristic gas of `CREDIT::allowAdapter` deploying this adapter. **/
  readonly allowGas: number;
  /** Validates and normalizes the deploy params of `CREDIT::allowAdapter`. **/
  readonly deployParamsSchema: z.ZodType<D>;
  /** Schema of the adapter's state, for diffing and item identity. **/
  readonly stateSchema: ObjectNode;
  /** Actions configuring the adapter once it is allowed. **/
  readonly actions: X;

  getDefaultParams(): D;
  /** Bytecode Repository deploy params of the adapter. **/
  getDeployParams(args: { creditManager: Address; params: D }): DeployParams;
  /** The adapter's state right after `CREDIT::allowAdapter`. **/
  getDeployState(params: D): S;
  /** The adapter's state as the Gearbox SDK reads it from chain. **/
  getStateFromSDK(adapter: AbstractAdapterContract<Abi, Abi>): S;
  /** Source reads run once; the returned check can be replayed against projected state. **/
  resolveValidation?(
    args: ResolveAdapterValidationArgs<D>,
  ): Promise<AdapterValidation>;
  /** UI check of the deploy params against the chain; a string is the error. **/
  validateParams?(args: ValidateAdapterParamsArgs<D>): Promise<false | string>;
}

/**
 * Declares an adapter plugin.
 *
 * Curried so that the deploy params and state types are given explicitly while
 * the actions record is inferred, keeping each action's own type:
 *
 * ```ts
 * export const uniswapV3Plugin = defineAdapterPlugin<
 *   UniswapV3AdapterDeployParams,
 *   UniswapV3AdapterState
 * >()({
 *   type: "UNISWAP_V3_ROUTER",
 *   …,
 *   actions: { setPoolBatchStatus: setPoolBatchStatusActionData },
 * });
 * ```
 *
 * @throws when an action's type is not `ADAPTER::<type>::…`
 **/
export function defineAdapterPlugin<
  D extends AdapterDeployParamsBase,
  S extends AdapterStateBase,
>() {
  return <const X extends AdapterActions = Record<never, never>>(
    definition: AdapterPluginDefinition<D, S, X>,
  ): AdapterPluginDefinition<D, S, X> => {
    const prefix = `ADAPTER::${definition.type}::`;
    for (const action of Object.values(definition.actions)) {
      if (!action.type.startsWith(prefix)) {
        throw new Error(
          `Action ${action.type} of the ${definition.type} adapter plugin must be named ${prefix}<function>`,
        );
      }
    }
    const resolve = definition.resolveValidation;
    return {
      ...definition,
      validateParams:
        definition.validateParams ??
        (resolve
          ? async args => {
              try {
                return (await resolve(args))(
                  args.marketChanges.after,
                  args.creditManager,
                  args.instance,
                );
              } catch {
                return "Invalid adapter target";
              }
            }
          : undefined),
    };
  };
}

/** Deploy params of a plugin (or a union of plugins). **/
export type DeployParamsOf<P> =
  P extends AdapterPluginDefinition<infer D, AdapterStateBase, AdapterActions>
    ? D
    : never;

/** Adapter state of a plugin (or a union of plugins). **/
export type AdapterStateOf<P> = P extends {
  getDeployState(params: never): infer S;
}
  ? S
  : never;

/** Action definitions of a plugin (or a union of plugins). **/
export type ActionDefinitionsOf<P> = P extends { readonly actions: infer X }
  ? X[keyof X]
  : never;
