/** Scaffolding shared by the adapter action definitions. **/
import type { Address } from "viem";
import {
  type ActionDiagnostic,
  actionError,
  actionWarning,
} from "../../actions/actionDiagnostics.js";
import type {
  CreditManagerTarget,
  ResolvedParams,
} from "../../actions/creditManagerTargets.js";
import type { MergePolicy } from "../../actions/defineMarketAction.js";
import {
  byAdapter,
  requiresCreditManager,
  resource,
} from "../../actions/utils/actionKeys.js";
import {
  creditManagerNotFound,
  findCreditManager,
  noOp,
} from "../../actions/utils/checkHelpers.js";
import type { ListNode } from "../../state/diff/schemaNodes.js";
import type { MarketState } from "../../state/market/types.js";
import { lowerAddress } from "../../utils/addressUtils.js";
import { stableStringify } from "../../utils/objectUtils.js";
import type { AdapterActionContext } from "./adapterMarketActionsData.js";
import type { AdapterStateBase } from "./defineAdapterPlugin.js";
import { updateAdapterState } from "./updateAdapterState.js";

/**
 * Keys, placement and merging of an action addressed to one adapter.
 *
 * An adapter is identified by its credit manager and target. A later action
 * for the same adapter merges into the earlier one and moves to the end, so it
 * runs after the `CREDIT::allowAdapter` that deploys the adapter.
 **/
export const adapterActionKeys = {
  key: byAdapter,
  merge: { position: "last" },
  requires: (params: {
    creditManager: CreditManagerTarget;
    target: Address;
  }) => [
    ...requiresCreditManager(params),
    resource.adapter(params.creditManager, params.target),
  ],
} as const;

/** Updates the state of the adapter an action is addressed to. **/
export function updateActionAdapter<T extends AdapterStateBase>(
  state: MarketState,
  params: { creditManager: Address; target: Address },
  update: (adapter: T) => T,
): MarketState {
  return updateAdapterState({
    state,
    creditManager: params.creditManager,
    target: params.target,
    update,
  });
}

/**
 * The adapter an action is addressed to must be allowed in its credit manager
 * and be of the kind the action configures.
 **/
export function adapterDiagnostics(
  state: MarketState,
  params: { creditManager: Address; target: Address },
  type: string,
): ActionDiagnostic[] {
  const cm = findCreditManager(state, params.creditManager);
  if (!cm) return [creditManagerNotFound(params.creditManager)];
  const adapter = cm.adapters[lowerAddress(params.target)];
  if (!adapter) {
    return [
      actionError(
        "ADAPTER_NOT_FOUND",
        `No adapter for ${params.target} is allowed in the credit manager`,
        ["params", "target"],
      ),
    ];
  }
  return adapter.type === type
    ? []
    : [
        actionError(
          "ADAPTER_TYPE_MISMATCH",
          `The adapter for ${params.target} is ${adapter.type}, not ${type}`,
          ["params", "target"],
        ),
      ];
}

/**
 * `items` merged into `current`, by item key: a later item replaces an earlier
 * one with the same key in its position, new items are appended.
 **/
function upsertItems<I>(
  current: readonly I[],
  items: readonly I[],
  key: (item: I) => string,
): I[] {
  const merged = new Map<string, I>();
  for (const item of [...current, ...items]) merged.set(key(item), item);
  return [...merged.values()];
}

type BatchParams<F extends string> = AdapterActionContext & {
  [K in F]: readonly unknown[];
};

type ResolvedBatchParams<F extends string> = {
  creditManager: Address;
  target: Address;
} & { [K in F]: readonly unknown[] };

/**
 * Members of a definition whose action sets the status of a batch of items —
 * pools, pairs, vaults, tokens — of one adapter.
 *
 * The items are identified by the same key the adapter's state schema uses to
 * compare them, so one key decides how batches merge, how the state is
 * updated and how a projection is diffed against the chain:
 *
 * - a later batch for the same adapter merges into the earlier one, item by
 *   item, and moves to the end;
 * - the adapter state holds each item once, with its latest status;
 * - a batch that changes nothing is an error, unchanged items in a batch that
 *   changes others are a warning.
 **/
export function adapterBatch<
  F extends string,
  P extends BatchParams<F>,
  S extends AdapterStateBase,
>(spec: {
  type: string;
  /** The params field holding the items; the state field has the same name. **/
  field: F;
  /**
   * The item list of the adapter's state schema, which the plugin's
   * `stateSchema` uses for `field` too: its key identifies an item everywhere.
   **/
  list: ListNode;
  /** An item of the params as the adapter state stores it. **/
  toState(item: P[F][number]): unknown;
}) {
  const { type, field, list, toState } = spec;
  const key = (item: unknown) => list.key(item);
  const present = (item: unknown) => list.present?.(item) ?? true;
  const stateItems = (params: { [K in F]: readonly unknown[] }) =>
    params[field].map(item => toState(item as P[F][number]));
  const merge: MergePolicy<P> = {
    position: "last",
    combine: (earlier, later) =>
      ({
        ...later,
        [field]: upsertItems(earlier[field], later[field], item =>
          key(toState(item as P[F][number])),
        ),
      }) as P,
  };

  return {
    ...adapterActionKeys,
    merge,
    check: ({
      state,
      params,
    }: {
      state: MarketState;
      params: ResolvedParams<P>;
    }): ActionDiagnostic[] => {
      const resolved = params as unknown as ResolvedBatchParams<F>;
      const diagnostics = adapterDiagnostics(state, resolved, type);
      if (diagnostics.length > 0) return diagnostics;
      const adapter = findCreditManager(state, resolved.creditManager)
        ?.adapters[lowerAddress(resolved.target)] as unknown as Record<
        F,
        unknown[] | undefined
      >;
      const current = new Map(
        (adapter[field] ?? []).map(item => [key(item), item] as const),
      );
      const unchanged = stateItems(resolved).filter(item => {
        const existing = current.get(key(item));
        return existing === undefined
          ? !present(item)
          : stableStringify(existing) === stableStringify(item);
      });
      if (unchanged.length === 0) return [];
      const path = ["params", field];
      return unchanged.length === resolved[field].length
        ? [noOp(`The adapter's ${field} already have these statuses`, path)]
        : [
            actionWarning(
              "ITEMS_UNCHANGED",
              `${unchanged.length} of the ${field} already have their status`,
              path,
            ),
          ];
    },
    apply: ({
      state,
      params,
    }: {
      state: MarketState;
      params: ResolvedParams<P>;
    }): MarketState => {
      const resolved = params as unknown as ResolvedBatchParams<F>;
      return updateActionAdapter<S>(state, resolved, adapter => {
        const items = adapter as unknown as Record<F, unknown[] | undefined>;
        return {
          ...adapter,
          [field]: upsertItems(items[field] ?? [], stateItems(resolved), key),
        };
      });
    },
  };
}
