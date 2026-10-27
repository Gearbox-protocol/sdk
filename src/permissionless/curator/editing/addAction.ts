/**
 * Adding an action to a GIP's action list.
 *
 * Every caller — the SDK builders, bundle merges, the app — adds actions the
 * same way:
 *
 * 1. An action of the same type and `key` as an earlier one merges into it,
 *    following the definition's `merge` policy: it takes the earlier action's
 *    place, or moves to the end (`position: "last"`); `combine` decides the
 *    merged params, the later action's by default.
 * 2. Any other action goes to the end — unless an action already recorded
 *    `requires` something it `provides`. Then it goes right before the first
 *    such action, so a Degen NFT is registered before the credit suite that
 *    uses it, and a contract is deployed before it is registered.
 **/
import { isSameTarget, targetOf } from "../actions/creditManagerTargets.js";
import type { MergePolicy } from "../actions/defineMarketAction.js";
import type { GipMarketAction } from "../actions/types.js";
import type { ConfiguratorActions } from "../configurator-actions/types.js";
import { GipRegistry } from "../GipRegistry.js";

interface AnyAction {
  type: string;
  params: object;
}

interface PlacementRules<A extends AnyAction> {
  key(action: A): string | undefined;
  merge(action: A): MergePolicy<object> | undefined;
  requires(action: A): readonly string[];
  provides(action: A): readonly string[];
}

/** Position for a new action: see the module comment. **/
function placementIndex<A extends AnyAction>(
  actions: readonly A[],
  action: A,
  rules: PlacementRules<A>,
): number {
  const provides = new Set(rules.provides(action));
  const requires = new Set(rules.requires(action));
  const firstDependent =
    provides.size === 0
      ? -1
      : actions.findIndex(candidate =>
          rules.requires(candidate).some(name => provides.has(name)),
        );
  let lastProvider = -1;
  if (requires.size > 0) {
    actions.forEach((candidate, index) => {
      if (rules.provides(candidate).some(name => requires.has(name))) {
        lastProvider = index;
      }
    });
  }
  // @dev a dependent recorded before what this action needs cannot be fixed
  // by placement; it stays at the end and its check reports the gap
  return firstDependent > lastProvider ? firstDependent : actions.length;
}

/** Whether both actions address the same credit manager. **/
function sameTarget(a: AnyAction, b: AnyAction): boolean {
  const target = targetOf(a.params);
  const other = targetOf(b.params);
  return (
    target !== undefined && other !== undefined && isSameTarget(target, other)
  );
}

function insertAt<A>(actions: readonly A[], index: number, action: A): A[] {
  return [...actions.slice(0, index), action, ...actions.slice(index)];
}

function addAction<A extends AnyAction>(
  actions: readonly A[],
  action: A,
  rules: PlacementRules<A>,
): A[] {
  const key = rules.key(action);
  const index =
    key === undefined
      ? -1
      : actions.findLastIndex(
          candidate =>
            candidate.type === action.type && rules.key(candidate) === key,
        );
  if (index === -1) {
    return insertAt(actions, placementIndex(actions, action, rules), action);
  }

  const policy = rules.merge(action) ?? {};
  if (
    actions
      .slice(index + 1)
      .some(
        candidate =>
          policy.barriers?.includes(candidate.type) &&
          (rules.key(candidate) === key || sameTarget(candidate, action)),
      )
  ) {
    return insertAt(actions, placementIndex(actions, action, rules), action);
  }
  const earlier = actions[index];
  const merged = {
    ...action,
    params: policy.combine
      ? policy.combine(earlier.params, action.params)
      : action.params,
  } as A;
  if ((policy.position ?? "first") === "first") {
    return [...actions.slice(0, index), merged, ...actions.slice(index + 1)];
  }
  const rest = [...actions.slice(0, index), ...actions.slice(index + 1)];
  return insertAt(rest, placementIndex(rest, merged, rules), merged);
}

function marketRules(registry: GipRegistry): PlacementRules<GipMarketAction> {
  const definition = (action: GipMarketAction) =>
    registry.requireMarketAction(action.type);
  return {
    key: action => definition(action).key(action.params),
    merge: action => definition(action).merge as MergePolicy<object>,
    requires: action => definition(action).requires?.(action.params) ?? [],
    provides: action => definition(action).provides?.(action.params) ?? [],
  };
}

function configuratorRules(
  registry: GipRegistry,
): PlacementRules<ConfiguratorActions> {
  const definition = (action: ConfiguratorActions) =>
    registry.requireConfiguratorAction(action.type);
  return {
    key: action => definition(action).key(action.params),
    merge: action => definition(action).merge as MergePolicy<object>,
    requires: () => [],
    provides: () => [],
  };
}

/**
 * `actions` with `action` added; see the module comment. `registry` holds the
 * definitions of the actions' types: the built-in ones by default.
 **/
export function addMarketAction<A extends GipMarketAction>(
  actions: readonly A[],
  action: A,
  registry: GipRegistry = GipRegistry.builtin,
): A[] {
  return addAction<A>(actions, action, marketRules(registry));
}

/** `actions` with every action of `added` added in order. **/
export function addMarketActions<A extends GipMarketAction>(
  actions: readonly A[],
  added: readonly A[],
  registry: GipRegistry = GipRegistry.builtin,
): A[] {
  const rules = marketRules(registry);
  return added.reduce<A[]>(
    (list, action) => addAction<A>(list, action, rules),
    [...actions],
  );
}

/** `actions` with `action` added; see the module comment. **/
export function addConfiguratorAction(
  actions: readonly ConfiguratorActions[],
  action: ConfiguratorActions,
  registry: GipRegistry = GipRegistry.builtin,
): ConfiguratorActions[] {
  return addAction(actions, action, configuratorRules(registry));
}

/** `actions` with every action of `added` added in order. **/
export function addConfiguratorActions(
  actions: readonly ConfiguratorActions[],
  added: readonly ConfiguratorActions[],
  registry: GipRegistry = GipRegistry.builtin,
): ConfiguratorActions[] {
  const rules = configuratorRules(registry);
  return added.reduce<ConfiguratorActions[]>(
    (list, action) => addAction(list, action, rules),
    [...actions],
  );
}
