import { GipActionError } from "../actions/actionDiagnostics.js";
import type { ConfiguratorActions } from "../configurator-actions/types.js";
import { addConfiguratorActions } from "../editing/addAction.js";
import { ConfigurationExecutor } from "../executor/ConfigurationExecutor.js";
import { getConfiguratorState } from "../state/configurator/getConfiguratorState.js";
import type { ConfiguratorState } from "../state/configurator/types.js";
import { isSameAddress } from "../utils/addressUtils.js";
import {
  type ConfiguratorScopedAction,
  parseConfiguratorScopedAction,
} from "./actionScope.js";
import type { GipSdkRuntime } from "./GipSdkRuntime.js";
import {
  type ScopeCompilation,
  ScopedBuilder,
  type ScopePlanFields,
} from "./ScopedBuilder.js";
import { snapshot } from "./snapshot.js";
import type {
  ConfiguratorGipPlan,
  ConfiguratorPreview,
  StateProvenance,
} from "./types.js";

/**
 * Records configurator-scoped intent — the entities every market of this
 * MarketConfigurator shares (admins, governor, treasury splitter configuration).
 *
 * There is no bundle application here: bundles describe one market's collateral
 * and adapter setup and only exist in the market scope.
 **/
export class ConfiguratorBuilder extends ScopedBuilder<
  ConfiguratorScopedAction,
  ConfiguratorActions,
  ConfiguratorPreview,
  ConfiguratorGipPlan
> {
  readonly #initialState?: ConfiguratorState;
  readonly #provenance: StateProvenance;

  constructor(init: {
    runtime: GipSdkRuntime;
    initialState?: ConfiguratorState;
    provenance: StateProvenance;
  }) {
    super(init.runtime);
    this.#initialState = init.initialState
      ? snapshot(init.initialState)
      : undefined;
    this.#provenance = init.provenance;
  }

  get scope(): "configurator" {
    return "configurator";
  }

  /**
   * Records a configurator-scoped action. Market-scoped actions are rejected
   * by the type and by the runtime guard.
   **/
  addAction(action: ConfiguratorScopedAction): this {
    return this.record(
      snapshot(
        parseConfiguratorScopedAction(action, this.runtime.registry),
      ) as ConfiguratorActions,
    );
  }

  protected async compile(
    recorded: readonly ConfiguratorActions[],
    eta: number,
  ): Promise<ScopeCompilation<ConfiguratorPreview>> {
    const { runtime } = this;
    // Recorded actions are added the way every caller adds them: a later
    // action merges into an earlier one with the same key.
    const actions = addConfiguratorActions([], recorded, runtime.registry);
    const executor = new ConfigurationExecutor(runtime.ctx, {
      timestamp: this.executionTimestamp(eta),
      resolveCache: runtime.resolveCache,
      registry: runtime.registry,
    });
    const changes = await executor.execute(
      await this.#resolveInitialState(),
      actions,
    );

    const preview = snapshot<ConfiguratorPreview>({
      scope: "configurator",
      source: runtime.source,
      eta,
      stateProvenance: this.#provenance,
      before: changes.before,
      after: changes.after,
      resolvedActions: actions,
      actionDiagnostics: changes.diagnostics,
      ...(changes.blockedAt !== undefined
        ? { blockedAt: changes.blockedAt }
        : {}),
      incompleteChecks: [
        ...runtime.notes,
        ...(this.#initialState
          ? []
          : [
              {
                check: "configuratorState.shutdown",
                reason:
                  "the legacy configurator state reader does not read shutdown and currently reports false",
              },
            ]),
      ],
    });

    const payloadCalls = changes.txs.map(({ tx }) => tx);
    return {
      preview,
      payloadCalls,
      // Configurator payloads go into a single batch: there is no per-action
      // gas table for them, so they cannot be split by estimated gas and
      // the gas model is reported as `unavailable` rather than as a zero
      // estimate.
      batches: [{ txs: payloadCalls, estimatedGas: 0, touchedFeeds: [] }],
      gasModel: "unavailable",
      expected: { expectedConfigurator: preview.after },
      ...(changes.blockedAt !== undefined
        ? { blocked: new GipActionError(changes.diagnostics) }
        : {}),
    };
  }

  protected planFields(
    preview: ConfiguratorPreview,
  ): ScopePlanFields<ConfiguratorGipPlan> {
    return {
      stateProvenance: preview.stateProvenance,
      before: preview.before,
      after: preview.after,
      resolvedActions: preview.resolvedActions,
    };
  }

  async #resolveInitialState(): Promise<ConfiguratorState> {
    const { runtime } = this;
    const { marketConfigurator } = runtime.source;

    if (this.#initialState) {
      // Supplied state is authoritative: it is never replaced by a chain read.
      const state = snapshot(this.#initialState);
      if (!isSameAddress(state.address, marketConfigurator)) {
        throw new Error(
          `Supplied configurator state is for ${state.address}, but this SDK is scoped to ${marketConfigurator}`,
        );
      }
      return state;
    }
    return getConfiguratorState(runtime.readClient, marketConfigurator);
  }
}
