import { type Address, BaseError } from "viem";
import { GipActionError } from "../actions/actionDiagnostics.js";
import type { GipBuilderContext } from "../actions/builderContext.js";
import type { CreateCreditSuiteAction } from "../actions/createCreditSuiteActionData.js";
import {
  type CreditManagerTarget,
  type CreditSuiteRef,
  creditSuiteRef,
  isCreditSuiteRef,
  retargetCreditManager,
  targetOf,
} from "../actions/creditManagerTargets.js";
import type { GipMarketAction, MarketActions } from "../actions/types.js";
import {
  applyBundle,
  bundleSuiteId,
  usesBundleTarget,
} from "../bundles/applyBundle.js";
import type { Bundle } from "../bundles/Bundle.js";
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
import type { MarketState, PeripheryState } from "../state/market/types.js";
import { batchMarketTransactions } from "../transactions/batchMarketTransactions.js";
import {
  isSameAddress,
  lowerAddress,
  uniqueAddresses,
} from "../utils/addressUtils.js";
import { checkActionParams } from "./actionScope.js";
import type { DiagnosticMarketInput } from "./collectGipDiagnostics.js";
import { collectGipDiagnostics } from "./collectGipDiagnostics.js";
import { collectPredictedDeployments } from "./collectPredictedDeployments.js";
import type { GipSdkRuntime } from "./GipSdkRuntime.js";
import { rwaPeripheryLookups } from "./rwaPeripheryLookups.js";
import type { ScopeCompilation } from "./ScopedBuilder.js";
import { snapshot } from "./snapshot.js";
import { tokensForCompilation } from "./TokenDecimalsCache.js";
import type {
  BundleApplication,
  IncompleteCheck,
  MarketDiagnostic,
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

/** Immutable scope and intents captured before asynchronous compilation starts. */
export interface MarketDraft {
  readonly pool?: Address;
  readonly initialState?: MarketState;
  readonly provenance: StateProvenance;
  readonly intents: readonly MarketIntent[];
}
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

/** A builder's recorded intent, resolved into the actions the market executes. **/
export interface PreparedMarket {
  ctx: GipBuilderContext;
  tokenDecimals: Record<Address, number>;
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
    tokenDecimals: prepared.tokenDecimals,
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

export function executePreparedMarket(
  runtime: GipSdkRuntime,
  prepared: PreparedMarket,
  eta: number,
  actions: GipMarketAction[] = prepared.actions,
  periphery?: PeripheryState[],
): Promise<MarketExecution> {
  return new MarketExecutor(prepared.ctx, {
    ...runtime.executorOptions(eta),
    periphery,
  }).execute(prepared.initialState, actions);
}

export class MarketCompiler {
  constructor(
    readonly runtime: GipSdkRuntime,
    readonly draft: MarketDraft,
  ) {}

  async compile(eta: number): Promise<ScopeCompilation<MarketPreview>> {
    const { runtime } = this;
    const prepared = await this.prepare(eta);
    const changes = await executePreparedMarket(runtime, prepared, eta);
    const found = await collectGipDiagnostics({
      runtime,
      markets: [diagnosticMarket(prepared.actions, changes)],
    });
    const preview = marketPreview({ runtime, eta, prepared, changes, found });

    return {
      preview,
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

  async prepare(eta: number): Promise<PreparedMarket> {
    const {
      runtime,
      draft: { intents },
    } = this;
    const tokenDecimals: Record<Address, number> = {};
    const ctx = {
      ...runtime.ctx,
      tokens: {
        decimals: (token: Address) => {
          const value = runtime.tokens.decimals(token);
          tokenDecimals[lowerAddress(token)] = value;
          return value;
        },
      },
    };
    const ensure = async (tokens: Address[]) => {
      await runtime.tokens.ensure(tokens);
      Object.assign(tokenDecimals, runtime.tokens.resolved(tokens));
    };
    const recordedActions = intents.flatMap(intent =>
      intent.kind === "action" ? [intent.action] : [],
    );
    const bundles = intents.flatMap(intent =>
      intent.kind === "bundle" ? [intent.bundle] : [],
    );

    const initialState = await this.#resolveInitialState(recordedActions);

    await ensure(
      tokensForCompilation({
        state: initialState,
        actions: recordedActions,
        bundles,
      }),
    );

    const executor = new MarketExecutor(ctx, runtime.executorOptions(eta));
    // @dev for predicted addresses only: a suite an action check blocks, say
    // until another market of a merged GIP registers its Degen NFT, has one too
    const unchecked = new MarketExecutor(ctx, {
      ...runtime.executorOptions(eta),
      checkActions: false,
    });
    const { actions, bundleApplications, suiteIds } =
      await this.#resolveActions(intents, initialState, executor, unchecked);

    // Tokens a bundle merge introduced were not known when decimals were
    // prefetched, so top the cache up before the final replay.
    await ensure(
      tokensForCompilation({ state: initialState, actions, bundles: [] }),
    );

    return {
      ctx,
      tokenDecimals,
      pool: this.draft.pool,
      provenance: this.draft.provenance,
      initialState,
      actions,
      bundleApplications,
      suiteIds,
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
      this.draft.pool ??
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
    const pool = this.draft.pool;

    if (this.draft.initialState) {
      // Supplied state is authoritative: it is never replaced by a chain read.
      const state = snapshot(this.draft.initialState);
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
