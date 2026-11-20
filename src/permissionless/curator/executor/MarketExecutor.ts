import type { Address } from "viem";
import type { RawTx } from "../../../onchain/index.js";
import type { MarketConfiguratorContract } from "../../bindings/market-configurator.js";
import {
  type ActionDiagnostic,
  actionError,
  CHECK_UNAVAILABLE,
  type GipActionDiagnostic,
  GipActionError,
  hasErrors,
  locateDiagnostics,
} from "../actions/actionDiagnostics.js";
import type { ActionEnv } from "../actions/actionTypes.js";
import type { GipBuilderContext } from "../actions/builderContext.js";
import {
  BUNDLE_TARGET,
  creditSuiteId,
  isCreditSuiteRef,
  retargetCreditManager,
  targetOf,
} from "../actions/creditManagerTargets.js";
import {
  type MarketActionDefinition,
  marketIdentity,
} from "../actions/defineMarketAction.js";
import type { GipMarketAction } from "../actions/types.js";
import type { ConfiguratorTx } from "../configurator-actions/ConfiguratorTx.js";
import type { ConfiguratorActions } from "../configurator-actions/types.js";
import type { GipRegistry } from "../GipRegistry.js";
import type { IncompleteCheck } from "../session/types.js";
import { isCreditManagerExpired } from "../state/market/isCreditManagerExpired.js";
import type { MarketState, PeripheryState } from "../state/market/types.js";
import type { MarketStateChanges, ParsedMarketTx } from "../types.js";
import { isSameAddress, lowerAddress } from "../utils/addressUtils.js";
import { actionEnv, type ExecutorOptions } from "./actionEnv.js";
import { buildConfiguratorTxs } from "./ConfigurationExecutor.js";
import { ResolveCache } from "./ResolveCache.js";

type AnyDefinition = MarketActionDefinition<GipMarketAction>;

/** Actions whose `resolve` reads run at once, ahead of the run. **/
const PREFETCH_CONCURRENCY = 8;

/**
 * Runs an action's `resolve` step through `cache`.
 *
 * Only the market's identity is passed on, never its state, which is what
 * makes the result reusable for any replay of the same action.
 **/
async function resolveMarketAction(args: {
  ctx: GipBuilderContext;
  cache: ResolveCache;
  definition: AnyDefinition;
  state: MarketState | undefined;
  params: GipMarketAction["params"];
  registry: GipRegistry;
}): Promise<unknown> {
  const { ctx, cache, definition, state, params } = args;
  const { resolve } = definition;
  if (!resolve) return undefined;
  const market = state ? marketIdentity(state) : undefined;
  const key = { type: definition.type, market, params };
  const result = await cache.run(key, async () => {
    const tokens = new Set<Address>();
    const value = await resolve({
      ctx: {
        ...ctx,
        tokens: {
          decimals(token) {
            const decimals = ctx.tokens.decimals(token);
            tokens.add(token);
            return decimals;
          },
        },
      },
      market,
      params,
      registry: args.registry,
    });
    return { value, tokens };
  });
  // Replaying a cached prediction must report the same metadata dependencies.
  for (const token of result.tokens) ctx.tokens.decimals(token);
  return result.value;
}

/** What a run of actions produced, up to the first action that cannot run. **/
export interface MarketProjection {
  before: MarketState;
  after: MarketState;
  /**
   * The actions as executed: credit suite references resolved to addresses.
   * Up to, not including, `blockedAt`.
   **/
  resolvedActions: GipMarketAction[];
  /** Addresses of the credit suites deployed with an id, by id. **/
  creditSuites: Record<string, Address>;
  /** Every `check` finding, warnings included, located by action. **/
  diagnostics: GipActionDiagnostic[];
  incompleteChecks: IncompleteCheck[];
  /**
   * Index of the first action whose `check` found an error. The projection
   * stops there: `after` is the state right before it.
   **/
  blockedAt?: number;
}

export interface MarketExecution extends MarketProjection {
  /** Transactions of the actions before `blockedAt`. **/
  txs: ParsedMarketTx[];
}

export interface MarketExecutorOptions extends ExecutorOptions {
  /**
   * Periphery deployed or registered by earlier markets of the same GIP. The
   * Bytecode Repository and the periphery registry are configurator-wide, so
   * the market sees these entries from its first action on.
   **/
  periphery?: readonly PeripheryState[];
}

/** Everything a run derives from one action. **/
interface ActionStep {
  action: GipMarketAction;
  definition: AnyDefinition;
  resolved: unknown;
  /** State right before the action; `undefined` for the one creating it. **/
  before: MarketState | undefined;
  after: MarketState;
}

export class MarketExecutor {
  public readonly mc: MarketConfiguratorContract;
  public readonly ctx: GipBuilderContext;
  public readonly env: ActionEnv;
  readonly #cache: ResolveCache;
  readonly #checkActions: boolean;
  readonly #periphery: readonly PeripheryState[];

  constructor(ctx: GipBuilderContext, options: MarketExecutorOptions = {}) {
    this.#checkActions = options.checkActions !== false;
    this.#periphery = options.periphery ?? [];
    this.mc = ctx.marketConfigurator;
    this.ctx = ctx;
    this.env = { ...actionEnv(options), tokens: ctx.tokens };
    this.#cache = options.resolveCache ?? new ResolveCache();
  }

  /**
   * The state `actions` leave behind, without encoding their transactions.
   * Never throws for a failing `check`: see {@link MarketProjection}.
   *
   * `before` may be `undefined` only when the first action creates the market;
   * the state right after creation is then reported as `before`.
   **/
  async project(
    before: MarketState | undefined,
    actions: readonly GipMarketAction[],
  ): Promise<MarketProjection> {
    return projection(await this.#run(before, actions));
  }

  /**
   * Like {@link executeBatch}, but reports a failing `check` instead of
   * throwing: transactions are encoded up to the blocked action.
   **/
  async execute(
    before: MarketState | undefined,
    actions: readonly GipMarketAction[],
  ): Promise<MarketExecution> {
    const run = await this.#run(before, actions);
    return {
      ...projection(run),
      txs: run.steps.map((step, index) => this.#encode(step, index)),
    };
  }

  /**
   * Replays `actions` on top of `before`, producing each action's transaction
   * and the state it leaves behind.
   *
   * `before` may be `undefined` only when the first action creates the market;
   * the state right after creation is then reported as `before`.
   *
   * @throws GipActionError when an action's `check` finds an error
   **/
  async executeBatch(
    before: MarketState | undefined,
    actions: readonly GipMarketAction[],
  ): Promise<MarketStateChanges> {
    const execution = await this.execute(before, actions);
    if (execution.blockedAt !== undefined) {
      throw new GipActionError(execution.diagnostics);
    }
    return {
      before: execution.before,
      after: execution.after,
      txs: execution.txs,
      diagnostics: execution.diagnostics,
      incompleteChecks: execution.incompleteChecks,
    };
  }

  executeConfiguratorTxs(
    actions: ConfiguratorActions[],
  ): Promise<ConfiguratorTx[]> {
    return buildConfiguratorTxs(this.ctx, actions, {
      resolveCache: this.#cache,
      registry: this.env.registry,
    });
  }

  decimals(token: Address): number {
    return this.ctx.tokens.decimals(token);
  }

  async #run(
    initial: MarketState | undefined,
    actions: readonly GipMarketAction[],
  ): Promise<Run> {
    const steps: ActionStep[] = [];
    const diagnostics: GipActionDiagnostic[] = [];
    const creditSuites: Record<string, Address> = {};
    const incompleteChecks: IncompleteCheck[] = [
      {
        check: "executionState",
        reason:
          "Source-block checks cannot establish future prices, permissions, deployment availability or integration-specific restrictions; verify execution on a fork",
      },
    ];
    /** Moves incomplete checks out of `found` into `incompleteChecks`. **/
    const extractChecks = (
      found: ActionDiagnostic[],
      index: number,
      type: string,
    ) => {
      const kept: ActionDiagnostic[] = [];
      for (const finding of found) {
        if (finding.code === CHECK_UNAVAILABLE) {
          incompleteChecks.push({
            check: `action:${index}:${type}`,
            reason: finding.message,
          });
        } else {
          kept.push(finding);
        }
      }
      return kept;
    };
    const start = initial && this.#withPeriphery(initial);
    const run = (blockedAt?: number): Run => ({
      start,
      steps,
      diagnostics,
      creditSuites,
      incompleteChecks,
      ...(blockedAt === undefined ? {} : { blockedAt }),
    });
    let state = start && {
      ...start,
      creditManagers: Object.fromEntries(
        Object.entries(start.creditManagers).map(([address, cm]) => [
          address,
          { ...cm, isExpired: isCreditManagerExpired(cm, this.env.timestamp) },
        ]),
      ),
    };

    if (state) this.#prefetch(state, actions, 0);
    for (const [index, recorded] of actions.entries()) {
      const definition = this.env.registry.requireMarketAction(recorded.type);
      const target = resolveTarget(recorded, creditSuites);
      if ("diagnostic" in target) {
        diagnostics.push(
          ...locateDiagnostics([target.diagnostic], index, recorded.type),
        );
        return run(index);
      }
      const action = target.action;
      const { params } = action;
      const resolved = this.#needsResolve(definition)
        ? await this.#resolve(definition, state, params)
        : undefined;
      const env = this.env;

      if (state === undefined && (index !== 0 || !definition.create))
        throw new Error("Market state is undefined");
      const created =
        state === undefined
          ? definition.create?.({ params, resolved, env })
          : undefined;
      const found = this.#checkActions
        ? extractChecks(
            state
              ? (definition.check?.({ state, params, resolved, env }) ?? [])
              : (definition.checkCreate?.({ params, resolved, env }) ?? []),
            index,
            action.type,
          )
        : [];
      diagnostics.push(...locateDiagnostics(found, index, action.type));
      if (hasErrors(found))
        return { ...run(index), ...(created && { created }) };
      const after = state
        ? definition.apply({ state, params, resolved, env })
        : this.#withPeriphery(created!);

      const suiteId = definition.suiteId?.(recorded.params);
      const deployed = definition.deployedContract?.({ params, resolved });
      if (suiteId !== undefined && deployed) {
        creditSuites[suiteId] = lowerAddress(deployed);
      }

      steps.push({ action, definition, resolved, before: state, after });
      // @dev a created market's reads can only start once its identity is known
      if (state === undefined) this.#prefetch(after, actions, index + 1);
      state = after;
    }

    return run();
  }

  /** Whether `definition`'s `resolve` runs: not when only skipped checks need it. **/
  #needsResolve(definition: AnyDefinition): boolean {
    return (
      definition.resolve !== undefined &&
      (this.#checkActions || !definition.resolvesForChecksOnly)
    );
  }

  #resolve(
    definition: AnyDefinition,
    state: MarketState | undefined,
    params: GipMarketAction["params"],
  ): Promise<unknown> {
    return resolveMarketAction({
      ctx: this.ctx,
      cache: this.#cache,
      definition,
      state,
      params,
      registry: this.env.registry,
    });
  }

  /**
   * Starts the `resolve` step of `actions` from `from` on, at most
   * {@link PREFETCH_CONCURRENCY} at a time, without waiting for it. A
   * resolution depends only on the market's identity and the params, so the
   * run finds each one in the cache, and concurrent reads share multicalls
   * instead of following one another. An action naming a credit suite by
   * reference waits for the run: its target is known once the suite is
   * deployed. A failed read is left to the run, which tries it again.
   **/
  #prefetch(
    state: MarketState,
    actions: readonly GipMarketAction[],
    from: number,
  ): void {
    const queue = actions.slice(from).filter(action => {
      // @dev an unknown type is the run's to reject
      const definition = this.env.registry.marketAction(action.type) as
        | AnyDefinition
        | undefined;
      const target = targetOf(action.params);
      return (
        definition !== undefined &&
        this.#needsResolve(definition) &&
        (target === undefined || !isCreditSuiteRef(target))
      );
    });
    const worker = async () => {
      let action = queue.shift();
      while (action !== undefined) {
        const definition = this.env.registry.requireMarketAction(action.type);
        await this.#resolve(definition, state, action.params).catch(() => {});
        action = queue.shift();
      }
    };
    for (let i = 0; i < Math.min(PREFETCH_CONCURRENCY, queue.length); i++)
      void worker();
  }

  /** `state` with {@link MarketExecutorOptions.periphery}, which supersedes it. **/
  #withPeriphery(state: MarketState): MarketState {
    if (this.#periphery.length === 0) return state;
    const own = (state.periphery ?? []).filter(
      entry =>
        !this.#periphery.some(p => isSameAddress(p.address, entry.address)),
    );
    return { ...state, periphery: [...own, ...this.#periphery] };
  }

  #encode(step: ActionStep, actionIndex: number): ParsedMarketTx {
    const { action, definition, resolved, after } = step;
    const { params } = action;
    const tx: RawTx = definition.encode({
      ctx: this.ctx,
      // @dev the action that creates the market is encoded against the
      // state it creates
      state: step.before ?? after,
      params,
      resolved,
      env: this.env,
    });
    if (BigInt(tx.value) !== 0n) {
      throw new Error(
        `${action.type} encodes a nonzero native value. Curator governance payloads require zero value.`,
      );
    }
    const newContract = definition.deployedContract?.({ params, resolved });
    return {
      tx,
      action,
      actionIndex,
      ...(newContract ? { newContract } : {}),
      estimatedGas: definition.gas({ params, after, env: this.env }),
      touchedFeeds:
        definition.touchedFeeds?.({ params, after, env: this.env }) ?? [],
      decoded: this.mc.parseFunctionData(tx.callData),
    };
  }
}

interface Run {
  /** The state the run started from, `undefined` when it creates the market. **/
  start?: MarketState;
  created?: MarketState;
  steps: ActionStep[];
  diagnostics: GipActionDiagnostic[];
  incompleteChecks: IncompleteCheck[];
  creditSuites: Record<string, Address>;
  blockedAt?: number;
}

/**
 * The action with a `suite:<id>` target replaced by the suite's address, or
 * the diagnostic when no earlier action deployed that suite.
 **/
function resolveTarget(
  action: GipMarketAction,
  creditSuites: Readonly<Record<string, Address>>,
): { action: GipMarketAction } | { diagnostic: ActionDiagnostic } {
  const target = targetOf(action.params);
  if (target === undefined || !isCreditSuiteRef(target)) return { action };
  const address = creditSuites[creditSuiteId(target)];
  if (address)
    return { action: retargetCreditManager(action, target, address) };
  return {
    diagnostic: actionError(
      "UNKNOWN_CREDIT_SUITE",
      target === BUNDLE_TARGET
        ? "The bundle's credit manager is not bound: the bundle deploys no single credit suite and no target was given"
        : `No earlier action deploys credit suite ${creditSuiteId(target)}`,
      ["params", "creditManager"],
    ),
  };
}

function projection(run: Run): MarketProjection {
  const before = run.start ?? run.steps[0]?.after ?? run.created;
  const after = run.steps.at(-1)?.after ?? run.start ?? run.created;
  if (!before || !after) throw new Error("Market state is undefined");
  return {
    before,
    after,
    resolvedActions: run.steps.map(step => step.action),
    creditSuites: run.creditSuites,
    diagnostics: run.diagnostics,
    incompleteChecks: run.incompleteChecks,
    ...(run.blockedAt !== undefined ? { blockedAt: run.blockedAt } : {}),
  };
}
