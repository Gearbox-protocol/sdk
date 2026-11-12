/**
 * How a market action type is declared.
 *
 * Everything the builder knows about one action type lives in its definition:
 * the schema that validates its params, its scope, its gas and price feed
 * footprint, how it changes the market state and how it is encoded. The
 * registry in `marketActionDefinitions.ts` lists the definitions, and the `MarketActions`
 * union is derived from that list, so adding a definition there is the only
 * registration step.
 *
 * Executing an action is split in four:
 *
 * 1. `resolve` — the only asynchronous step: everything the action needs from
 *    the chain (predicted addresses, address provider entries). It sees the
 *    market's identity, not its state, so its result can be memoized and a
 *    replay of the same actions makes no further reads.
 * 2. `check` — whether the action can run on the state before it; an error
 *    stops the projection there (see `actionDiagnostics.ts`).
 * 3. `apply` (or `create`) — the state transition: pure and synchronous.
 * 4. `encode` — the payload call: pure and synchronous.
 **/

import type { Address } from "viem";
import type { z } from "zod/v4";
import type { RawTx } from "../../../onchain/index.js";
import type { GipRegistry } from "../GipRegistry.js";
import type { MarketState } from "../state/market/types.js";
import type { ActionDiagnostic } from "./actionDiagnostics.js";
import type { ActionEnv, BaseMarketAction } from "./actionTypes.js";
import type { GipBuilderContext } from "./builderContext.js";
import type { ResolvedParams } from "./creditManagerTargets.js";

export type AnyMarketAction = BaseMarketAction<string, object>;

/**
 * The fields of a market that never change once it exists. They are all a
 * `resolve` step may depend on, which is what makes its result reusable.
 **/
export type MarketIdentity = Pick<
  MarketState,
  "address" | "name" | "symbol" | "underlyingAsset" | "minorVersion"
>;

/**
 * Params as the steps after recording see them: a credit suite reference is
 * resolved to the suite's address (see `creditManagerTargets.ts`).
 **/
export type StepParams<A extends AnyMarketAction> = ResolvedParams<A["params"]>;

export interface ResolveArgs<A extends AnyMarketAction> {
  ctx: GipBuilderContext;
  /** `undefined` for the action that creates the market. **/
  market: MarketIdentity | undefined;
  params: StepParams<A>;
  registry: GipRegistry;
}

export interface ApplyArgs<A extends AnyMarketAction, R> {
  state: MarketState;
  params: StepParams<A>;
  resolved: R;
  env: ActionEnv;
}

export interface CheckArgs<A extends AnyMarketAction, R> {
  /** Market state right before the action. **/
  state: MarketState;
  params: StepParams<A>;
  resolved: R;
  env: ActionEnv;
}

export interface CreateArgs<A extends AnyMarketAction, R> {
  params: StepParams<A>;
  resolved: R;
  env: ActionEnv;
}

export interface EncodeArgs<A extends AnyMarketAction, R> {
  ctx: GipBuilderContext;
  /** Market state right before the action (right after it, for `create`). **/
  state: MarketState;
  params: StepParams<A>;
  resolved: R;
  env: ActionEnv;
}

/** What gas and price feed estimates of an action may depend on. **/
export interface ActionFootprintArgs<A extends AnyMarketAction> {
  params: StepParams<A>;
  /** Market state right after the action. **/
  after: MarketState;
  env: ActionEnv;
}

export interface MarketActionDefinition<
  A extends AnyMarketAction = AnyMarketAction,
  R = unknown,
> {
  readonly type: A["type"];
  readonly scope: "market";
  readonly name?: string;
  readonly description: string;
  /** Validates and normalizes params; its output is the action's params type. **/
  readonly schema: z.ZodType<A["params"]>;
  /**
   * The schema in a given registry, when validation depends on it — e.g.
   * `CREDIT::allowAdapter`, whose deploy params belong to the adapter's
   * plugin. Defaults to {@link schema}.
   **/
  paramsSchema?(registry: GipRegistry): z.ZodType<A["params"]>;

  /**
   * Reads what the action needs from the chain. Must depend on nothing but
   * its arguments: results are memoized per action type, market identity and
   * params.
   **/
  resolve?(args: ResolveArgs<A>): Promise<R>;
  /**
   * Whether the action can run on the state before it: an `error` means the
   * call would revert (or do nothing) and stops the projection there; a
   * `warning` is reported. Pure and synchronous. It is not run for `create`.
   **/
  check?(args: CheckArgs<A, R>): ActionDiagnostic[];
  /** Checks source facts for the first action, before its created state can be used. **/
  checkCreate?(args: CreateArgs<A, R>): ActionDiagnostic[];
  /**
   * The market an action creates. Only an action that may come first, before
   * any market state exists, defines it.
   **/
  create?(args: CreateArgs<A, R>): MarketState;
  /** The state transition: pure and synchronous. **/
  apply(args: ApplyArgs<A, R>): MarketState;
  /** The payload call: pure and synchronous. **/
  encode(args: EncodeArgs<A, R>): RawTx;
  /** Contract the action deploys, if any. **/
  deployedContract?(args: {
    params: StepParams<A>;
    resolved: R;
  }): Address | undefined;
  /**
   * Id under which later actions refer to the credit suite this action
   * deploys, as `suite:<id>`.
   **/
  suiteId?(params: A["params"]): string | undefined;

  /**
   * Heuristic gas of the action's payload call, used to split a GIP into
   * batches. Measured values are noted next to each estimate.
   **/
  gas(args: ActionFootprintArgs<A>): number;
  /** Price feeds the call reads, which the governor updates before executing it. **/
  touchedFeeds?(args: ActionFootprintArgs<A>): Address[];

  /**
   * What the action configures. A later action of the same type with the same
   * key merges into the earlier one (see {@link merge}); `undefined` means
   * actions of this type never merge.
   **/
  key(params: A["params"]): string | undefined;
  /** How an action merges into an earlier one with the same key. **/
  readonly merge?: MergePolicy<A["params"]>;
  /**
   * Resources the action makes available to later actions, and resources it
   * needs from earlier ones (see `editing/addAction.ts`). They decide
   * where a newly added action is placed.
   **/
  provides?(params: A["params"]): string[];
  requires?(params: A["params"]): string[];

  /** Phantom member carrying the action type for {@link ActionOf}; never set. **/
  readonly "~action"?: A;
}

export interface MergePolicy<P> {
  /** Preserve separate actions across transitions that consume/reset this setting. **/
  readonly barriers?: readonly string[];
  /**
   * Where the merged action goes: `first` (the default) keeps the earlier
   * action's position, `last` moves it after everything recorded since — for
   * actions that must follow what they configure.
   **/
  readonly position?: "first" | "last";
  /** Params of the merged action; the later action's by default. **/
  combine?(earlier: P, later: P): P;
}

export type MarketScopedDefinition<
  A extends AnyMarketAction,
  R = undefined,
> = MarketActionDefinition<A, R>;

/** What a definition states; the scope is set by the helper that declares it. **/
export type MarketActionInput<A extends AnyMarketAction, R> = Omit<
  MarketActionDefinition<A, R>,
  "scope" | "~action"
>;

/**
 * Declares a market action type.
 *
 * Annotate the constant with its definition type: the `MarketActions` union is
 * derived from the registered definitions, so a definition whose type had to
 * be inferred from its own body would be circular. An action with a `resolve`
 * step also names the type it resolves to.
 *
 * ```ts
 * export const pausePoolActionData: MarketScopedDefinition<PausePoolAction> =
 *   defineMarketAction<PausePoolAction>({
 *     type: "POOL::pause",
 *     …
 *   });
 * ```
 **/
export function defineMarketAction<A extends AnyMarketAction, R = undefined>(
  definition: MarketActionInput<A, R>,
): MarketScopedDefinition<A, R> {
  return { ...definition, scope: "market" };
}

/** The action type a definition (or a union of definitions) declares. **/
export type ActionOf<D> = D extends { readonly "~action"?: infer A }
  ? Exclude<A, undefined>
  : never;

/** The identity of a market; see {@link MarketIdentity}. **/
export function marketIdentity(state: MarketState): MarketIdentity {
  return {
    address: state.address,
    name: state.name,
    symbol: state.symbol,
    underlyingAsset: state.underlyingAsset,
    minorVersion: state.minorVersion,
  };
}

/**
 * An action of `definition`'s type with `params`, typed as that action.
 *
 * The typed way to build an action of an adapter plugin defined outside the
 * package: `createAction(myAdapter.actions.setPools, { … })`.
 **/
export function createAction<A extends AnyMarketAction>(
  definition: { readonly type: A["type"]; readonly "~action"?: A },
  params: A["params"],
): A {
  return { type: definition.type, params } as A;
}
