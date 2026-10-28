import type { MarketConfiguratorContract } from "../../bindings/market-configurator.js";
import {
  type GipActionDiagnostic,
  GipActionError,
  hasErrors,
  locateDiagnostics,
} from "../actions/actionDiagnostics.js";
import type { ActionEnv } from "../actions/actionTypes.js";
import type { GipBuilderContext } from "../actions/builderContext.js";
import type { ConfiguratorTx } from "../configurator-actions/ConfiguratorTx.js";
import type { ConfiguratorActionDefinition } from "../configurator-actions/defineConfiguratorAction.js";
import type { ConfiguratorActions } from "../configurator-actions/types.js";
import { GipRegistry } from "../GipRegistry.js";
import type { ConfiguratorState } from "../state/configurator/types.js";
import { actionEnv, type ExecutorOptions } from "./actionEnv.js";
import { ResolveCache } from "./ResolveCache.js";

export interface ConfiguratorStateChanges {
  before: ConfiguratorState;
  after: ConfiguratorState;
  txs: ConfiguratorTx[];
  /** Every `check` finding, warnings included, located by action. **/
  diagnostics: GipActionDiagnostic[];
  /**
   * Index of the first action whose `check` found an error. Nothing after it
   * is projected or encoded.
   **/
  blockedAt?: number;
}

type AnyDefinition = ConfiguratorActionDefinition<ConfiguratorActions>;

function resolveConfiguratorAction(args: {
  ctx: GipBuilderContext;
  cache: ResolveCache;
  definition: AnyDefinition;
  params: ConfiguratorActions["params"];
}): Promise<unknown> {
  const { ctx, cache, definition, params } = args;
  const { resolve } = definition;
  if (!resolve) return Promise.resolve(undefined);
  return cache.run({ type: definition.type, params }, () =>
    resolve({ ctx, params }),
  );
}

/** Transactions of configurator actions, in order, without projecting state. **/
export async function buildConfiguratorTxs(
  ctx: GipBuilderContext,
  actions: readonly ConfiguratorActions[],
  options: Pick<ExecutorOptions, "resolveCache" | "registry"> = {},
): Promise<ConfiguratorTx[]> {
  const cache = options.resolveCache ?? new ResolveCache();
  const registry = options.registry ?? GipRegistry.builtin;
  const txs: ConfiguratorTx[] = [];
  for (const action of actions) {
    const definition = registry.requireConfiguratorAction(action.type);
    const { params } = action;
    const resolved = await resolveConfiguratorAction({
      ctx,
      cache,
      definition,
      params,
    });
    txs.push({ tx: definition.encode({ ctx, params, resolved }), action });
  }
  return txs;
}

export class ConfigurationExecutor {
  public readonly mc: MarketConfiguratorContract;
  public readonly ctx: GipBuilderContext;
  public readonly env: ActionEnv;
  readonly #cache: ResolveCache;
  readonly #checkActions: boolean;

  constructor(ctx: GipBuilderContext, options: ExecutorOptions = {}) {
    this.#checkActions = options.checkActions !== false;
    this.mc = ctx.marketConfigurator;
    this.ctx = ctx;
    this.env = actionEnv(options);
    this.#cache = options.resolveCache ?? new ResolveCache();
  }

  /**
   * Projects and encodes configurator actions, reporting a failing `check`
   * instead of throwing.
   **/
  async execute(
    before: ConfiguratorState,
    actions: readonly ConfiguratorActions[],
  ): Promise<ConfiguratorStateChanges> {
    let state = before;
    const txs: ConfiguratorTx[] = [];
    const diagnostics: GipActionDiagnostic[] = [];

    for (const [index, action] of actions.entries()) {
      const definition = this.env.registry.requireConfiguratorAction(
        action.type,
      );
      const { params } = action;
      const resolved = await resolveConfiguratorAction({
        ctx: this.ctx,
        cache: this.#cache,
        definition,
        params,
      });
      const env = this.env;
      const found = this.#checkActions
        ? (definition.check?.({ state, params, resolved, env }) ?? [])
        : [];
      diagnostics.push(...locateDiagnostics(found, index, action.type));
      if (hasErrors(found)) {
        return { before, after: state, txs, diagnostics, blockedAt: index };
      }
      state = definition.apply({ state, params, resolved, env });
      txs.push({
        tx: definition.encode({ ctx: this.ctx, params, resolved }),
        action,
      });
    }

    return { before, after: state, txs, diagnostics };
  }

  /**
   * Execute a batch of configurator actions and track state changes
   *
   * @throws GipActionError when an action's `check` finds an error
   **/
  async executeBatch(
    before: ConfiguratorState,
    actions: readonly ConfiguratorActions[],
  ): Promise<ConfiguratorStateChanges> {
    const changes = await this.execute(before, actions);
    if (changes.blockedAt !== undefined) {
      throw new GipActionError(changes.diagnostics);
    }
    return changes;
  }

  /**
   * Execute configurator actions without state tracking (just get transactions)
   **/
  executeConfiguratorTxs(
    actions: readonly ConfiguratorActions[],
  ): Promise<ConfiguratorTx[]> {
    return buildConfiguratorTxs(this.ctx, actions, {
      resolveCache: this.#cache,
      registry: this.env.registry,
    });
  }
}
