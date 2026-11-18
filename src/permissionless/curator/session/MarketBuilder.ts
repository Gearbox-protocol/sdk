import type { Address } from "viem";
import type { CreateCreditSuiteAction } from "../actions/createCreditSuiteActionData.js";
import {
  type CreditManagerTarget,
  isCreditSuiteRef,
} from "../actions/creditManagerTargets.js";
import type {
  GipMarketAction,
  MarketActions,
  ValidMarketAction,
} from "../actions/types.js";
import type { Bundle } from "../bundles/Bundle.js";
import {
  type BundleCustomization,
  customizeBundle,
} from "../bundles/customizeBundle.js";
import { GipBuilderError } from "../bundles/GipBuilderError.js";
import type { MarketState } from "../state/market/types.js";
import { lowerAddress } from "../utils/addressUtils.js";
import {
  assertActionScope,
  type MarketScopedAction,
  parseMarketScopedAction,
} from "./actionScope.js";
import type { GipSdkRuntime } from "./GipSdkRuntime.js";
import { MarketCompiler, type MarketDraft } from "./MarketCompiler.js";
import {
  type ScopeCompilation,
  ScopedBuilder,
  type ScopePlanFields,
} from "./ScopedBuilder.js";
import { snapshot } from "./snapshot.js";
import type {
  MarketGipPlan,
  MarketIntent,
  MarketPreview,
  StateProvenance,
} from "./types.js";

export { GipTargetResolutionError } from "./MarketCompiler.js";
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

/** A target as recorded: references as written, addresses lowercased. **/
const normalizeTarget = (target: CreditManagerTarget): CreditManagerTarget =>
  isCreditSuiteRef(target) ? target : lowerAddress(target);

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

  protected compile(
    intents: readonly MarketIntent[],
    eta: number,
  ): Promise<ScopeCompilation<MarketPreview>> {
    return new MarketCompiler(this.runtime, this.captureDraft(intents)).compile(
      eta,
    );
  }

  /** @internal Capture the market scope and its immutable draft for the compiler. */
  captureDraft(intents = this.recordedActions()): MarketDraft {
    return {
      pool: this.#pool,
      initialState: this.#initialState,
      provenance: this.#provenance,
      intents,
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
      tokenDecimals: preview.tokenDecimals,
      diagnostics: preview.diagnostics,
    };
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
}
