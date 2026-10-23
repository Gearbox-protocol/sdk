import { type Address, BaseError } from "viem";
import { GipActionError } from "../actions/actionDiagnostics.js";
import type { CreateCreditSuiteAction } from "../actions/createCreditSuiteActionData.js";
import {
  type CreditManagerTarget,
  creditSuiteRef,
  isCreditSuiteRef,
} from "../actions/creditManagerTargets.js";
import type {
  GipMarketAction,
  MarketActions,
  ValidMarketAction,
} from "../actions/types.js";
import {
  applyBundle,
  bundleSuiteId,
  usesBundleTarget,
} from "../bundles/applyBundle.js";
import type { Bundle } from "../bundles/Bundle.js";
import {
  type BundleCustomization,
  customizeBundle,
} from "../bundles/customizeBundle.js";
import { addMarketAction } from "../editing/addAction.js";
import { MarketExecutor } from "../executor/MarketExecutor.js";
import { getMarketState } from "../state/market/getMarketState.js";
import type { MarketState } from "../state/market/types.js";
import { batchMarketTransactions } from "../transactions/batchMarketTransactions.js";
import {
  isSameAddress,
  lowerAddress,
  uniqueAddresses,
} from "../utils/addressUtils.js";
import {
  assertActionScope,
  checkActionParams,
  type MarketScopedAction,
  parseMarketScopedAction,
} from "./actionScope.js";
import { collectGipDiagnostics } from "./collectGipDiagnostics.js";
import { collectPredictedDeployments } from "./collectPredictedDeployments.js";
import type { GipSdkRuntime } from "./GipSdkRuntime.js";
import {
  type ScopeCompilation,
  ScopedBuilder,
  type ScopePlanFields,
} from "./ScopedBuilder.js";
import { snapshot } from "./snapshot.js";
import { tokensForCompilation } from "./TokenDecimalsCache.js";
import type {
  BundleApplication,
  MarketGipPlan,
  MarketIntent,
  MarketPreview,
  StateProvenance,
} from "./types.js";

/** Raised when a bundle's credit manager target cannot be determined. **/
export class GipTargetResolutionError extends BaseError {
  override name = "GipTargetResolutionError";

  constructor(
    public readonly code: "MISSING_TARGET" | "AMBIGUOUS_TARGET",
    message: string,
    public readonly candidates?: readonly Address[],
  ) {
    super(message);
  }
}

export interface MarketBuilderInit {
  runtime: GipSdkRuntime;
  pool?: Address;
  initialState?: MarketState;
  /** Pre-recorded intents, e.g. the `createMarket` action of `sdk.newMarket`. **/
  intents?: MarketIntent[];
  provenance: StateProvenance;
}

/** The same parameter overrides as the app's strategy form. **/
export type MarketBundleOptions = BundleCustomization;

/** The credit manager a bundle's placeholder stands for. **/
interface BundleTarget {
  /** Unset when the bundle deploys its own suite: `applyBundle` binds it. **/
  target?: CreditManagerTarget;
  /** Id of the suite the placeholder refers to, when it refers to one. **/
  suiteId?: string;
  resolution: BundleApplication["targetResolution"];
}

function creditSuiteActions(
  actions: readonly GipMarketAction[],
): CreateCreditSuiteAction[] {
  return actions.filter(
    (action): action is CreateCreditSuiteAction =>
      action.type === "MARKET::createCreditSuite",
  );
}

const isCreateMarket = (action: GipMarketAction | undefined): boolean =>
  action?.type === "MARKET::createMarket";

/**
 * Records market-scoped intent for exactly ONE market and compiles it into a
 * preview, a plan or a simulation.
 *
 * Recording is synchronous and chainable; `preview`, `build` and `simulate` are
 * asynchronous. Recorded actions, bundles and the supplied initial state are
 * copied on the way in and snapshots are frozen on the way out, so a produced
 * plan never changes afterwards and the builder never mutates caller data.
 **/
export class MarketBuilder extends ScopedBuilder<
  MarketScopedAction,
  MarketIntent,
  MarketPreview,
  MarketGipPlan
> {
  readonly #pool?: Address;
  readonly #initialState?: MarketState;
  readonly #provenance: StateProvenance;

  constructor(init: MarketBuilderInit) {
    super(init.runtime, init.intents ?? []);
    this.#pool = init.pool == null ? undefined : lowerAddress(init.pool);
    this.#initialState = init.initialState
      ? snapshot(init.initialState)
      : undefined;
    this.#provenance = init.provenance;
  }

  get scope(): "market" {
    return "market";
  }

  /** Pool this builder is scoped to, `undefined` for a market being created. **/
  get pool(): Address | undefined {
    return this.#pool;
  }

  /**
   * Records a market-scoped action.
   *
   * Configurator-scoped actions are rejected at compile time
   * by {@link MarketScopedAction} and at runtime by the scope guard, so JSON
   * input cannot slip past either.
   *
   * A built-in action's params are checked at compile time. An action of an
   * adapter plugin the SDK was created with is any `ADAPTER::…` action to the
   * compiler — build it with `createAction` for a typed one — and is
   * validated at runtime by its plugin, like every other action.
   **/
  addAction<const A extends MarketScopedAction>(
    action: A & ValidMarketAction<A>,
  ): this {
    // Scope-checked and normalized through the processor's Zod schema, so a
    // typed call and a JSON payload end up with identical parameters.
    return this.record({
      kind: "action",
      action: snapshot(parseMarketScopedAction(action, this.runtime.registry)),
    });
  }

  /**
   * Records a bundle application. Bundles only exist in the market scope.
   *
   * Zero-address placeholders resolve automatically to the credit suite the
   * bundle deploys, or to the market's single credit manager after earlier
   * recorded actions. Anything ambiguous or missing is rejected.
   *
   * Strategy-form overrides are copied, validated and applied before address
   * prediction. The supplied catalog bundle and options are never mutated.
   **/
  applyBundle(bundle: Bundle, options?: MarketBundleOptions): this {
    const customized = customizeBundle(bundle, options ?? {});
    const actions = customized.actions.map(action => {
      // Bundle payloads must still be market-scoped; their parameters are
      // normalized when valid. Legacy catalog payloads that predate a stricter
      // schema stay usable, but their schema error is reported at preview time.
      assertActionScope(action, "market", this.runtime.registry);
      try {
        return parseMarketScopedAction(
          action,
          this.runtime.registry,
        ) as MarketActions;
      } catch {
        return action;
      }
    });
    return this.record({
      kind: "bundle",
      bundle: snapshot({ ...customized, actions }),
    });
  }

  protected async compile(
    intents: readonly MarketIntent[],
  ): Promise<ScopeCompilation<MarketPreview>> {
    const { runtime } = this;
    const recordedActions = intents.flatMap(intent =>
      intent.kind === "action" ? [intent.action] : [],
    );
    const bundles = intents.flatMap(intent =>
      intent.kind === "bundle" ? [intent.bundle] : [],
    );

    const { state: initialState, provenance } =
      await this.#resolveInitialState(recordedActions);

    await runtime.tokens.ensure(
      tokensForCompilation({
        state: initialState,
        actions: recordedActions,
        bundles,
      }),
    );

    const executor = new MarketExecutor(runtime.ctx, {
      timestamp: runtime.source.blockTimestamp,
      resolveCache: runtime.resolveCache,
      registry: runtime.registry,
    });
    const { actions, bundleApplications, suiteIds } =
      await this.#resolveActions(intents, initialState, executor);

    // Tokens a bundle merge introduced were not known when decimals were
    // prefetched, so top the cache up before the final replay.
    await runtime.tokens.ensure(
      tokensForCompilation({ state: initialState, actions, bundles: [] }),
    );

    // @dev never throws for a failing `check`: the preview reports it and
    // `build()`/`simulate()` reject through `blocked`
    const changes = await executor.execute(initialState, actions);
    // The executed actions name credit managers by address; past a blocked
    // action the recorded ones follow, so indices still match `actions`.
    const resolvedActions = [
      ...changes.resolvedActions,
      ...actions.slice(changes.resolvedActions.length),
    ];
    const applications = bundleApplications.map((application, index) => {
      const suiteId = suiteIds[index];
      const address =
        suiteId === undefined ? undefined : changes.creditSuites[suiteId];
      return address
        ? { ...application, targetCreditManager: address }
        : application;
    });

    const { diagnostics, incompleteChecks } = await collectGipDiagnostics({
      runtime,
      markets: [
        {
          address: changes.after.address,
          underlyingAsset: changes.after.underlyingAsset,
          transactions: resolvedActions,
        },
      ],
    });

    const preview = snapshot<MarketPreview>({
      scope: "market",
      source: runtime.source,
      // For a new market this is the pool address the creation is predicted to
      // deploy to, so a preview always names the market it describes.
      pool: lowerAddress(this.#pool ?? changes.after.address),
      stateProvenance: provenance,
      ...(initialState ? { before: changes.before } : {}),
      after: changes.after,
      resolvedActions,
      bundles: applications,
      predictedDeployments: collectPredictedDeployments(changes.txs),
      tokenDecimals: runtime.tokens.resolved(),
      diagnostics,
      actionDiagnostics: changes.diagnostics,
      ...(changes.blockedAt !== undefined
        ? { blockedAt: changes.blockedAt }
        : {}),
      incompleteChecks: [
        ...runtime.notes,
        ...applications.flatMap(application =>
          (application.paramWarnings ?? []).map(reason => ({
            check: `bundleActionParams:${application.bundleName}`,
            reason,
          })),
        ),
        ...incompleteChecks,
      ],
    });

    return {
      preview,
      payloadCalls: changes.txs.map(({ tx }) => tx),
      batches: batchMarketTransactions({
        chainId: runtime.source.chainId,
        txs: changes.txs,
      }),
      expected: {
        expectedMarkets: [
          { address: preview.after.address, after: preview.after },
        ],
      },
      ...(changes.blockedAt !== undefined
        ? { blocked: new GipActionError(changes.diagnostics) }
        : {}),
    };
  }

  protected planFields(preview: MarketPreview): ScopePlanFields<MarketGipPlan> {
    return {
      ...(preview.pool ? { pool: preview.pool } : {}),
      stateProvenance: preview.stateProvenance,
      ...(preview.before ? { before: preview.before } : {}),
      after: preview.after,
      resolvedActions: preview.resolvedActions,
      predictedDeployments: preview.predictedDeployments,
      bundles: preview.bundles,
      diagnostics: preview.diagnostics,
    };
  }

  /**
   * Turns the recorded intents into one action list.
   *
   * Explicitly recorded actions keep their full sequence; only a bundle merge
   * is allowed to replace an earlier action.
   **/
  async #resolveActions(
    intents: readonly MarketIntent[],
    initialState: MarketState | undefined,
    executor: MarketExecutor,
  ): Promise<{
    actions: GipMarketAction[];
    bundleApplications: BundleApplication[];
    suiteIds: (string | undefined)[];
  }> {
    const { registry } = this.runtime;
    let actions: GipMarketAction[] = [];
    const bundleApplications: BundleApplication[] = [];
    /** Per bundle application: the suite its target refers to, if any. **/
    const suiteIds: (string | undefined)[] = [];

    for (const intent of intents) {
      if (intent.kind === "action") {
        actions = addMarketAction(actions, intent.action, registry);
        continue;
      }
      if (actions.length === 0 && initialState === undefined) {
        throw new Error(
          "A bundle cannot be applied before the market exists: record the createMarket action first",
        );
      }
      const { bundle } = intent;
      // @dev the bundle merge decides against the state the recorded actions
      // already produce. The replay only projects state, and the actions'
      // `resolve` results are memoized, so it reads nothing from the chain.
      const projection = await executor.project(initialState, actions);
      const currentState = projection.after;
      const { target, suiteId, resolution } = this.#resolveBundleTarget({
        bundle,
        currentState,
        actions,
        creditSuites: projection.creditSuites,
      });
      const before = actions;
      actions = applyBundle({
        actions,
        currentState,
        bundle,
        targetCmAddress: target,
        registry,
      });

      const changed = actions.filter(action => !before.includes(action));
      const typesBefore = new Set(before.map(({ type }) => type));
      const typesOf = (replaced: boolean) =>
        changed
          .filter(({ type }) => typesBefore.has(type) === replaced)
          .map(({ type }) => type);
      const paramWarnings = bundle.actions
        .map(action => checkActionParams(action, registry))
        .filter((warning): warning is string => warning !== undefined);

      bundleApplications.push({
        bundleName: bundle.name,
        ...(paramWarnings.length > 0 ? { paramWarnings } : {}),
        ...(target && !isCreditSuiteRef(target)
          ? { targetCreditManager: target }
          : {}),
        targetResolution: resolution,
        added: typesOf(false),
        replaced: typesOf(true),
      });
      suiteIds.push(suiteId);
    }

    return { actions, bundleApplications, suiteIds };
  }

  async #resolveInitialState(actions: readonly GipMarketAction[]): Promise<{
    state: MarketState | undefined;
    provenance: StateProvenance;
  }> {
    const { runtime } = this;
    const pool = this.#pool;

    if (this.#initialState) {
      // Supplied state is authoritative: it is never replaced by a chain read.
      const state = snapshot(this.#initialState);
      if (pool && !isSameAddress(state.address, pool)) {
        throw new Error(
          `Supplied market state is for pool ${state.address}, but this builder is scoped to ${pool}`,
        );
      }
      return { state, provenance: this.#provenance };
    }
    if (!pool) {
      if (!isCreateMarket(actions[0])) {
        throw new Error(
          "A market builder needs a pool, an initial state, or a first createMarket action",
        );
      }
      return { state: undefined, provenance: "new-market" };
    }
    if (isCreateMarket(actions[0])) {
      throw new Error(
        `Market ${pool} already exists, so createMarket cannot be its first action`,
      );
    }
    const state = await getMarketState(
      await runtime.onchainSdk(),
      runtime.source.marketConfigurator,
      pool,
      {
        client: runtime.readClient,
        timestamp: runtime.source.blockTimestamp,
        registry: runtime.registry,
      },
    );
    if (!isSameAddress(state.address, pool)) {
      throw new Error(
        `Loaded market state is for pool ${state.address}, but this builder is scoped to ${pool}`,
      );
    }
    return { state, provenance: this.#provenance };
  }

  #resolveBundleTarget(args: {
    bundle: Bundle;
    currentState: MarketState;
    actions: readonly GipMarketAction[];
    creditSuites: Readonly<Record<string, Address>>;
  }): BundleTarget {
    const { bundle, currentState, creditSuites } = args;
    if (!usesBundleTarget(bundle)) {
      return { resolution: "not-required" };
    }

    // A suite deployed by the bundle itself is unambiguously its own target:
    // `applyBundle` binds the placeholder to that suite's reference.
    const ownSuites = creditSuiteActions(bundle.actions);
    if (ownSuites.length === 1) {
      const [suite] = ownSuites;
      return {
        suiteId: suite.params.id ?? bundleSuiteId(bundle, suite),
        resolution: "predicted-suite",
      };
    }
    if (ownSuites.length > 1) {
      throw new GipTargetResolutionError(
        "AMBIGUOUS_TARGET",
        `Bundle "${bundle.name}" deploys ${ownSuites.length} credit suites; apply each strategy in a separate bundle`,
      );
    }

    // Earlier actions have already been projected, including suite creation.
    // Their predicted managers are therefore present in the current state.
    const candidates = uniqueAddresses(
      Object.values(currentState.creditManagers).map(
        manager => manager.address,
      ),
    );
    if (candidates.length === 0) {
      throw new GipTargetResolutionError(
        "MISSING_TARGET",
        `Bundle "${bundle.name}" targets a credit manager but the market has none; record a createCreditSuite action first`,
      );
    }
    if (candidates.length > 1) {
      throw new GipTargetResolutionError(
        "AMBIGUOUS_TARGET",
        `Bundle "${bundle.name}" could target ${candidates.length} credit managers; specify creditManager addresses in the bundle actions`,
        candidates,
      );
    }
    // @dev a suite recorded with an id is targeted by reference, so later
    // edits of its params keep the bundle attached to it
    const [candidate] = candidates;
    const suiteId = Object.entries(creditSuites).find(([, address]) =>
      isSameAddress(address, candidate),
    )?.[0];
    return {
      target: suiteId === undefined ? candidate : creditSuiteRef(suiteId),
      ...(suiteId === undefined ? {} : { suiteId }),
      resolution:
        creditSuiteActions(args.actions).length === 1
          ? "predicted-suite"
          : "existing-single-manager",
    };
  }
}
