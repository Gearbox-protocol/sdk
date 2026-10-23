import type { Address } from "viem";
import type { RawTx } from "../../../onchain/index.js";
import type { MarketConfiguratorContract } from "../../bindings/market-configurator.js";
import {
  type ActionDiagnostic,
  actionError,
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
import type { MarketState } from "../state/market/types.js";
import type { MarketStateChanges, ParsedMarketTx } from "../types.js";
import { lowerAddress } from "../utils/addressUtils.js";
import { actionEnv, type ExecutorOptions } from "./actionEnv.js";
import { buildConfiguratorTxs } from "./ConfigurationExecutor.js";
import { ResolveCache } from "./ResolveCache.js";

type AnyDefinition = MarketActionDefinition<GipMarketAction>;

/**
 * Runs an action's `resolve` step through `cache`.
 *
 * Only the market's identity is passed on, never its state, which is what
 * makes the result reusable for any replay of the same action.
 **/
export function resolveMarketAction(args: {
  ctx: GipBuilderContext;
  cache: ResolveCache;
  definition: AnyDefinition;
  state: MarketState | undefined;
  params: GipMarketAction["params"];
}): Promise<unknown> {
  const { ctx, cache, definition, state, params } = args;
  const { resolve } = definition;
  if (!resolve) return Promise.resolve(undefined);
  const market = state ? marketIdentity(state) : undefined;
  return cache.run({ type: definition.type, market, params }, () =>
    resolve({ ctx, market, params }),
  );
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

  constructor(ctx: GipBuilderContext, options: ExecutorOptions = {}) {
    this.mc = ctx.marketConfigurator;
    this.ctx = ctx;
    this.env = actionEnv(options);
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
    const run = await this.#run(before, actions);
    return projection(run, before);
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
      ...projection(run, before),
      txs: run.steps.map(step => this.#encode(step)),
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
    let state = initial;

    for (const [index, recorded] of actions.entries()) {
      const definition = this.env.registry.requireMarketAction(recorded.type);
      const target = resolveTarget(recorded, creditSuites);
      if ("diagnostic" in target) {
        diagnostics.push(
          ...locateDiagnostics([target.diagnostic], index, recorded.type),
        );
        return { steps, diagnostics, creditSuites, blockedAt: index };
      }
      const action = target.action;
      const { params } = action;
      const resolved = await resolveMarketAction({
        ctx: this.ctx,
        cache: this.#cache,
        definition,
        state,
        params,
      });
      const env = this.env;

      let after: MarketState;
      if (state === undefined) {
        if (index !== 0 || !definition.create) {
          throw new Error("Market state is undefined");
        }
        after = definition.create({ params, resolved, env });
      } else {
        const found =
          definition.check?.({ state, params, resolved, env }) ?? [];
        diagnostics.push(...locateDiagnostics(found, index, action.type));
        // @dev the batch would revert here: nothing after it is projected
        if (hasErrors(found)) {
          return { steps, diagnostics, creditSuites, blockedAt: index };
        }
        after = definition.apply({ state, params, resolved, env });
      }

      const suiteId = definition.suiteId?.(recorded.params);
      const deployed = definition.deployedContract?.({ params, resolved });
      if (suiteId !== undefined && deployed) {
        creditSuites[suiteId] = lowerAddress(deployed);
      }

      steps.push({ action, definition, resolved, before: state, after });
      state = after;
    }

    return { steps, diagnostics, creditSuites };
  }

  #encode(step: ActionStep): ParsedMarketTx {
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
    const newContract = definition.deployedContract?.({ params, resolved });
    return {
      tx,
      action,
      ...(newContract ? { newContract } : {}),
      estimatedGas: definition.gas({ params, after, env: this.env }),
      touchedFeeds:
        definition.touchedFeeds?.({ params, after, env: this.env }) ?? [],
      decoded: this.mc.parseFunctionData(tx.callData),
    };
  }
}

interface Run {
  steps: ActionStep[];
  diagnostics: GipActionDiagnostic[];
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

function projection(
  run: Run,
  initial: MarketState | undefined,
): MarketProjection {
  const before = initial ?? run.steps[0]?.after;
  const after = run.steps.at(-1)?.after ?? initial;
  if (!before || !after) throw new Error("Market state is undefined");
  return {
    before,
    after,
    resolvedActions: run.steps.map(step => step.action),
    creditSuites: run.creditSuites,
    diagnostics: run.diagnostics,
    ...(run.blockedAt !== undefined ? { blockedAt: run.blockedAt } : {}),
  };
}
