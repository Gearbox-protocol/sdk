import { type Address, BaseError } from "viem";
import { GipActionError } from "../actions/actionDiagnostics.js";
import type { CreateCreditSuiteAction } from "../actions/createCreditSuiteActionData.js";
import {
  type CreditManagerTarget,
  type CreditSuiteRef,
  creditSuiteRef,
  isCreditSuiteRef,
  retargetCreditManager,
  targetOf,
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
import { GipBuilderError } from "../bundles/GipBuilderError.js";
import {
  copyCmActionsForMarket,
  removeAdapterActions,
  replaceCmActions,
} from "../editing/actionListOperations.js";
import { addMarketAction } from "../editing/addAction.js";
import {
  type MarketExecution,
  MarketExecutor,
} from "../executor/MarketExecutor.js";
import { completeRwaPeripheryActions } from "../rwaPeripherySetup.js";
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
import {
  collectGipDiagnostics,
  type DiagnosticMarketInput,
} from "./collectGipDiagnostics.js";
import { collectPredictedDeployments } from "./collectPredictedDeployments.js";
import type { GipSdkRuntime } from "./GipSdkRuntime.js";
import { rwaPeripheryLookups } from "./rwaPeripheryLookups.js";
import {
  type ScopeCompilation,
  ScopedBuilder,
  type ScopePlanFields,
} from "./ScopedBuilder.js";
import { snapshot } from "./snapshot.js";
import { tokensForCompilation } from "./TokenDecimalsCache.js";
import type {
  BundleApplication,
  IncompleteCheck,
  MarketDiagnostic,
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

/** A target as recorded: references as written, addresses lowercased. **/
const normalizeTarget = (target: CreditManagerTarget): CreditManagerTarget =>
  isCreditSuiteRef(target) ? target : lowerAddress(target);

const isCreateMarket = (action: GipMarketAction | undefined): boolean =>
  action?.type === "MARKET::createMarket";

/** A builder's recorded intent, resolved into the actions the market executes. **/
export interface PreparedMarket {
  pool?: Address;
  provenance: StateProvenance;
  /** `undefined` for a market the first action creates. **/
  initialState?: MarketState;
  actions: GipMarketAction[];
  bundleApplications: BundleApplication[];
  /** Per bundle application: the suite its target refers to, if any. **/
  suiteIds: (string | undefined)[];
}

/** A market as `collectGipDiagnostics` sees it. **/
export function diagnosticMarket(
  actions: readonly GipMarketAction[],
  changes: MarketExecution,
): DiagnosticMarketInput {
  return {
    address: changes.after.address,
    underlyingAsset: changes.after.underlyingAsset,
    transactions: resolvedActions(actions, changes),
  };
}

/** The preview of one executed market. **/
export function marketPreview(args: {
  runtime: GipSdkRuntime;
  eta: number;
  prepared: PreparedMarket;
  changes: MarketExecution;
  found: {
    diagnostics: readonly MarketDiagnostic[];
    incompleteChecks: readonly IncompleteCheck[];
  };
}): MarketPreview {
  const { runtime, prepared, changes } = args;
  const applications = prepared.bundleApplications.map((application, index) => {
    const suiteId = prepared.suiteIds[index];
    const address =
      suiteId === undefined ? undefined : changes.creditSuites[suiteId];
    return address
      ? { ...application, targetCreditManager: address }
      : application;
  });
  return snapshot<MarketPreview>({
    scope: "market",
    source: runtime.source,
    txs: changes.txs,
    eta: args.eta,
    // For a new market this is the pool address the creation is predicted to
    // deploy to, so a preview always names the market it describes.
    pool: lowerAddress(prepared.pool ?? changes.after.address),
    stateProvenance: prepared.provenance,
    ...(prepared.initialState
      ? { before: changes.before }
      : { creationState: changes.before }),
    after: changes.after,
    inputActions: prepared.actions,
    resolvedActions: resolvedActions(prepared.actions, changes),
    bundles: applications,
    predictedDeployments: collectPredictedDeployments(changes.txs),
    tokenDecimals: runtime.tokens.resolved(),
    diagnostics: [...args.found.diagnostics],
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
      ...changes.incompleteChecks,
      ...args.found.incompleteChecks,
    ],
  });
}

/**
 * The executed actions, which name credit managers by address; past a blocked
 * action the recorded ones follow, so indices still match `actions`.
 **/
function resolvedActions(
  actions: readonly GipMarketAction[],
  changes: MarketExecution,
): GipMarketAction[] {
  return [
    ...changes.resolvedActions,
    ...actions.slice(changes.resolvedActions.length),
  ];
}

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
  /** Ids of the credit suites recorded so far, see {@link addAction}. **/
  readonly #suiteIds = new Set<string>();

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
   *
   * A credit suite recorded without an `id` gets one: its name, suffixed when
   * an earlier suite of this builder already uses it. Later actions can then
   * name it `suite:<id>`, and actions naming its predicted address are
   * rewritten to that reference when the builder compiles.
   **/
  addAction<const A extends MarketScopedAction>(
    action: A & ValidMarketAction<A>,
  ): this {
    // Scope-checked and normalized through the processor's Zod schema, so a
    // typed call and a JSON payload end up with identical parameters.
    const parsed = parseMarketScopedAction(action, this.runtime.registry);
    return this.record({
      kind: "action",
      action: snapshot(this.#withSuiteId(parsed)),
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

  /**
   * Records the periphery a Securitize RWA market needs, added after what was
   * recorded so far in executable order: its Degen NFT registered and, for an
   * `RWA_UNDERLYING::DEFAULT` underlying, its zapper deployed and registered.
   * A legacy author-derived zapper is replaced.
   *
   * Resolved against the chain when the builder compiles, like a bundle. It
   * adds nothing for an ordinary underlying or a complete setup, so it can be
   * recorded for every new market.
   **/
  addRwaPeriphery(): this {
    return this.record({ kind: "rwaPeriphery" });
  }

  /**
   * Replaces a credit suite this GIP deploys with `suite`; the actions that
   * configure it follow it, since they name it by reference.
   *
   * `creditManager` is the suite's predicted address — what a preview shows —
   * or its `suite:<id>` reference; the suite keeps its id. Resolved when the
   * builder compiles: naming anything but a suite of this market is a
   * `GipBuilderError` (`CREDIT_SUITE_NOT_FOUND`).
   **/
  replaceCreditSuite(
    creditManager: CreditManagerTarget,
    suite: CreateCreditSuiteAction,
  ): this {
    const parsed = parseMarketScopedAction(suite, this.runtime.registry);
    if (parsed.type !== "MARKET::createCreditSuite") {
      throw new GipBuilderError(
        "CREATE_CREDIT_SUITE_ACTION_NOT_FOUND",
        "A credit suite is replaced by a MARKET::createCreditSuite action",
      );
    }
    return this.record({
      kind: "replaceCreditSuite",
      creditManager: normalizeTarget(creditManager),
      suite: snapshot(parsed),
    });
  }

  /**
   * Adds a copy of a credit suite this GIP deploys, named `name`, with copies
   * of every action configuring it. The copy's id is `<id>#<name>`.
   *
   * `creditManager` is named as in {@link replaceCreditSuite}.
   **/
  copyCreditSuite(creditManager: CreditManagerTarget, name: string): this {
    return this.record({
      kind: "copyCreditSuite",
      creditManager: normalizeTarget(creditManager),
      name,
    });
  }

  /**
   * Drops everything recorded for one adapter of a credit manager: the
   * adapter's own actions and, unless `keepAllowTx`, the action allowing it.
   * A credit suite of this GIP may be named by its predicted address.
   **/
  removeAdapter(
    creditManager: CreditManagerTarget,
    target: Address,
    options: { keepAllowTx?: boolean } = {},
  ): this {
    return this.record({
      kind: "removeAdapter",
      creditManager: normalizeTarget(creditManager),
      target: lowerAddress(target),
      keepAllowTx: options.keepAllowTx ?? false,
    });
  }

  protected async compile(
    intents: readonly MarketIntent[],
    eta: number,
  ): Promise<ScopeCompilation<MarketPreview>> {
    const { runtime } = this;
    const prepared = await this.prepare(intents, eta);
    const executor = new MarketExecutor(
      runtime.ctx,
      runtime.executorOptions(eta),
    );
    // @dev never throws for a failing `check`: the preview reports it and
    // `build()`/`simulate()` reject through `blocked`
    const changes = await executor.execute(
      prepared.initialState,
      prepared.actions,
    );
    const found = await collectGipDiagnostics({
      runtime,
      markets: [diagnosticMarket(prepared.actions, changes)],
    });
    const preview = marketPreview({ runtime, eta, prepared, changes, found });

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

  /**
   * Resolves the state and the action list the recorded intent executes,
   * without executing it: a `MergedGip` executes several markets together.
   *
   * @internal
   **/
  async prepare(
    intents: readonly MarketIntent[],
    eta: number,
  ): Promise<PreparedMarket> {
    const { runtime } = this;
    const recordedActions = intents.flatMap(intent =>
      intent.kind === "action" ? [intent.action] : [],
    );
    const bundles = intents.flatMap(intent =>
      intent.kind === "bundle" ? [intent.bundle] : [],
    );

    const initialState = await this.#resolveInitialState(recordedActions);

    await runtime.tokens.ensure(
      tokensForCompilation({
        state: initialState,
        actions: recordedActions,
        bundles,
      }),
    );

    const executor = new MarketExecutor(
      runtime.ctx,
      runtime.executorOptions(eta),
    );
    // @dev for predicted addresses only: a suite an action check blocks, say
    // until another market of a merged GIP registers its Degen NFT, has one too
    const unchecked = new MarketExecutor(runtime.ctx, {
      ...runtime.executorOptions(eta),
      checkActions: false,
    });
    const { actions, bundleApplications, suiteIds } =
      await this.#resolveActions(intents, initialState, executor, unchecked);

    // Tokens a bundle merge introduced were not known when decimals were
    // prefetched, so top the cache up before the final replay.
    await runtime.tokens.ensure(
      tokensForCompilation({ state: initialState, actions, bundles: [] }),
    );

    return {
      pool: this.#pool,
      provenance: this.#provenance,
      initialState,
      actions,
      bundleApplications,
      suiteIds,
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
   * Explicit actions and bundle actions use the registry's merge rules.
   **/
  async #resolveActions(
    intents: readonly MarketIntent[],
    initialState: MarketState | undefined,
    executor: MarketExecutor,
    unchecked: MarketExecutor,
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
      if (
        intent.kind === "replaceCreditSuite" ||
        intent.kind === "copyCreditSuite" ||
        intent.kind === "removeAdapter"
      ) {
        actions = await this.#editCreditSuite(
          intent,
          actions,
          initialState,
          unchecked,
        );
        continue;
      }
      if (intent.kind === "rwaPeriphery") {
        actions = await this.#completeRwaPeriphery(
          actions,
          initialState,
          unchecked,
        );
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

    actions = await this.#referenceSuites(actions, initialState, unchecked);
    return { actions, bundleApplications, suiteIds };
  }

  /** A credit suite with an id, see {@link addAction}; other actions as is. **/
  #withSuiteId(action: GipMarketAction): GipMarketAction {
    if (action.type !== "MARKET::createCreditSuite") return action;
    const given = action.params.id;
    if (given !== undefined) {
      this.#suiteIds.add(given);
      return action;
    }
    const base = action.params.name.trim() || "suite";
    let id = base;
    for (let n = 2; this.#suiteIds.has(id); n++) id = `${base}#${n}`;
    this.#suiteIds.add(id);
    return { ...action, params: { ...action.params, id } };
  }

  /**
   * `actions` with every credit manager target that is the predicted address
   * of a suite this market deploys spelled as that suite's reference, so a
   * persisted list keeps following the suite when its params change. The list
   * is merged again when anything was rewritten, so an action recorded once by
   * address and once by reference counts once.
   **/
  async #referenceSuites(
    actions: GipMarketAction[],
    initialState: MarketState | undefined,
    executor: MarketExecutor,
  ): Promise<GipMarketAction[]> {
    return (await this.#suiteReferences(actions, initialState, executor))
      .actions;
  }

  /**
   * {@link #referenceSuites}, with the reference of every suite the market
   * deploys by its predicted address.
   **/
  async #suiteReferences(
    actions: GipMarketAction[],
    initialState: MarketState | undefined,
    executor: MarketExecutor,
  ): Promise<{
    actions: GipMarketAction[];
    refs: ReadonlyMap<Address, CreditSuiteRef>;
  }> {
    if (!actions.some(action => action.type === "MARKET::createCreditSuite"))
      return { actions, refs: new Map() };
    const { creditSuites } = await executor.project(initialState, actions);
    const refs = new Map(
      Object.entries(creditSuites).map(([id, address]) => [
        lowerAddress(address),
        creditSuiteRef(id),
      ]),
    );
    let rewritten = false;
    const referenced = actions.map(action => {
      const target = targetOf(action.params);
      const ref =
        target === undefined || isCreditSuiteRef(target)
          ? undefined
          : refs.get(lowerAddress(target));
      if (!target || !ref) return action;
      rewritten = true;
      return retargetCreditManager(action, target, ref);
    });
    if (!rewritten) return { actions, refs };
    const { registry } = this.runtime;
    return {
      actions: referenced.reduce<GipMarketAction[]>(
        (merged, action) => addMarketAction(merged, action, registry),
        [],
      ),
      refs,
    };
  }

  /**
   * Applies a credit suite edit to `actions`, once every action names the
   * market's suites by reference: the edit then never predicts an address.
   **/
  async #editCreditSuite(
    intent: Extract<
      MarketIntent,
      { kind: "replaceCreditSuite" | "copyCreditSuite" | "removeAdapter" }
    >,
    actions: GipMarketAction[],
    initialState: MarketState | undefined,
    executor: MarketExecutor,
  ): Promise<GipMarketAction[]> {
    const { actions: referenced, refs } = await this.#suiteReferences(
      actions,
      initialState,
      executor,
    );
    const list = referenced as MarketActions[];
    const ref = isCreditSuiteRef(intent.creditManager)
      ? intent.creditManager
      : refs.get(lowerAddress(intent.creditManager));

    if (intent.kind === "removeAdapter") {
      return removeAdapterActions({
        actions: list,
        // @dev an existing credit manager keeps its address
        creditManager: ref ?? intent.creditManager,
        target: intent.target,
        keepAllowTx: intent.keepAllowTx,
      });
    }

    const index = list.findIndex(
      action =>
        action.type === "MARKET::createCreditSuite" &&
        action.params.id !== undefined &&
        creditSuiteRef(action.params.id) === ref,
    );
    const suite = list[index];
    if (!ref || suite?.type !== "MARKET::createCreditSuite") {
      throw new GipBuilderError(
        "CREDIT_SUITE_NOT_FOUND",
        `Credit manager ${intent.creditManager} is not a credit suite this GIP deploys`,
      );
    }
    const id = suite.params.id as string;

    if (intent.kind === "replaceCreditSuite") {
      return replaceCmActions({
        actions: list,
        index,
        replacement: {
          ...intent.suite,
          params: { ...intent.suite.params, id },
        },
        oldCm: ref,
        newCm: ref,
      });
    }
    return copyCmActionsForMarket({
      actions: list,
      index,
      name: intent.name,
      oldCm: ref,
      newCm: creditSuiteRef(`${id}#${intent.name}`),
    });
  }

  /** `actions` with the market's RWA periphery setup completed. **/
  async #completeRwaPeriphery(
    actions: GipMarketAction[],
    initialState: MarketState | undefined,
    executor: MarketExecutor,
  ): Promise<GipMarketAction[]> {
    const [first] = actions;
    const underlying =
      initialState?.underlyingAsset ??
      (first?.type === "MARKET::createMarket"
        ? first.params.underlying
        : undefined);
    if (!underlying) {
      throw new Error(
        "RWA periphery cannot be added before the market exists: record the createMarket action first",
      );
    }
    // @dev the zapper is built for the pool: a new market's is predicted
    const pool =
      this.#pool ??
      (await executor.project(initialState, actions)).after.address;
    return completeRwaPeripheryActions({
      ...rwaPeripheryLookups(this.runtime),
      actions,
      underlying,
      pool,
    });
  }

  /** The state the actions start from; `undefined` for a market being created. **/
  async #resolveInitialState(
    actions: readonly GipMarketAction[],
  ): Promise<MarketState | undefined> {
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
      return state;
    }
    if (!pool) {
      if (!isCreateMarket(actions[0])) {
        throw new Error(
          "A market builder needs a pool, an initial state, or a first createMarket action",
        );
      }
      return undefined;
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
    return state;
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
