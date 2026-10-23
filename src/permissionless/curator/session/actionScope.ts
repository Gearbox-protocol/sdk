import { BaseError } from "viem";
import type { GipMarketAction } from "../actions/types.js";
import type { ConfiguratorActions } from "../configurator-actions/types.js";
import { GipRegistry } from "../GipRegistry.js";

/**
 * Scopes a GIP action can belong to.
 *
 * - `market` — applies to exactly ONE market of the configurator, including
 *   the periphery contracts it deploys and registers.
 * - `configurator` — applies to entities shared by every market of the
 *   configurator (admins, governor, treasury splitter).
 **/
export type ActionScope = "market" | "configurator";

/**
 * Actions the market builder accepts: built-in ones and those of adapter
 * plugins registered with the SDK.
 **/
export type MarketScopedAction = GipMarketAction;

/** Actions the configurator builder accepts. **/
export type ConfiguratorScopedAction = ConfiguratorActions;

/** The scope an action type belongs to, or `undefined` when it is unknown. **/
export function getActionScope(
  type: string,
  registry: GipRegistry = GipRegistry.builtin,
): ActionScope | undefined {
  const market = registry.marketAction(type);
  if (market) return market.scope;
  if (registry.configuratorAction(type)) return "configurator";
  return undefined;
}

export type GipScopeErrorCode =
  | "UNKNOWN_ACTION_TYPE"
  | "WRONG_SCOPE"
  | "INVALID_ACTION_SHAPE";

/** Raised when an action does not belong to the builder it was handed to. **/
export class GipScopeError extends BaseError {
  override name = "GipScopeError";
  /** Type of the action that was rejected, when it had one. **/
  readonly actionType?: string;
  /** Scope of the builder the action was handed to. **/
  readonly expected?: ActionScope;
  /** Scope the action belongs to, when it is known. **/
  readonly actual?: ActionScope;

  constructor(
    public readonly code: GipScopeErrorCode,
    message: string,
    context: {
      type?: string;
      expected?: ActionScope;
      actual?: ActionScope;
    } = {},
  ) {
    super(message);
    if (context.type !== undefined) this.actionType = context.type;
    if (context.expected !== undefined) this.expected = context.expected;
    if (context.actual !== undefined) this.actual = context.actual;
  }
}

function readActionShape(input: unknown): { type: string; params: unknown } {
  if (input === null || typeof input !== "object") {
    throw new GipScopeError(
      "INVALID_ACTION_SHAPE",
      "A GIP action must be an object with a `type` and `params`",
    );
  }
  const { type, params } = input as { type?: unknown; params?: unknown };
  if (typeof type !== "string" || type.length === 0) {
    throw new GipScopeError(
      "INVALID_ACTION_SHAPE",
      "A GIP action must carry a non-empty string `type`",
    );
  }
  return { type, params };
}

function assertScope(
  type: string,
  expected: ActionScope,
  registry: GipRegistry,
): void {
  const actual = getActionScope(type, registry);
  if (actual === undefined) {
    throw new GipScopeError(
      "UNKNOWN_ACTION_TYPE",
      `Unknown GIP action type "${type}"`,
      { type, expected },
    );
  }
  if (actual !== expected) {
    throw new GipScopeError(
      "WRONG_SCOPE",
      `Action "${type}" is ${actual}-scoped and cannot be used in the ${expected} scope`,
      { type, expected, actual },
    );
  }
}

/** Params schema of an action type in any scope, or `undefined` when unknown. **/
function findParamsSchema(type: string, registry: GipRegistry) {
  const definition =
    registry.marketAction(type) ?? registry.configuratorAction(type);
  return definition && registry.paramsSchema(definition);
}

/**
 * Validates an untrusted action against `scope` and returns it with its
 * parameters normalized by the processor's Zod schema.
 **/
function parseScopedAction(
  input: unknown,
  scope: ActionScope,
  registry: GipRegistry,
) {
  const { type, params } = readActionShape(input);
  assertScope(type, scope, registry);
  // `assertScope` only passes for registered types, so a schema exists.
  return { type, params: findParamsSchema(type, registry)!.parse(params) };
}

/**
 * Validates an untrusted (e.g. JSON) action as market-scoped and returns it with
 * its parameters normalized by the processor's Zod schema.
 **/
export function parseMarketScopedAction(
  input: unknown,
  registry: GipRegistry = GipRegistry.builtin,
): MarketScopedAction {
  return parseScopedAction(input, "market", registry) as MarketScopedAction;
}

/** Validates an untrusted action as configurator-scoped and normalizes params. **/
export function parseConfiguratorScopedAction(
  input: unknown,
  registry: GipRegistry = GipRegistry.builtin,
): ConfiguratorScopedAction {
  return parseScopedAction(
    input,
    "configurator",
    registry,
  ) as ConfiguratorScopedAction;
}

/**
 * Runtime scope guard for an already-typed action. Builders call this so that a
 * value that only type-checks because it came from `any`/JSON still fails.
 **/
export function assertActionScope(
  action: { type: string },
  expected: ActionScope,
  registry: GipRegistry = GipRegistry.builtin,
): void {
  assertScope(readActionShape(action).type, expected, registry);
}

/**
 * Checks an action's params against its processor schema without throwing.
 *
 * Used for bundle payloads: a catalog bundle is applied as authored (the legacy
 * builder never validated it either), so a schema complaint is reported instead
 * of rejecting a bundle that works today.
 **/
export function checkActionParams(
  action: { type: string; params: unknown },
  registry: GipRegistry = GipRegistry.builtin,
): string | undefined {
  const schema = findParamsSchema(action.type, registry);
  if (!schema) return `unknown action type "${action.type}"`;
  const result = schema.safeParse(action.params);
  return result.success
    ? undefined
    : `${action.type}: ${result.error.issues
        .map(
          failure => `${failure.path.join(".") || "params"} ${failure.message}`,
        )
        .join("; ")}`;
}
