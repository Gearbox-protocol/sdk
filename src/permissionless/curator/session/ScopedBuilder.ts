import type { Address } from "viem";
import type { RawTx } from "../../../onchain/index.js";
import type { GipActionError } from "../actions/actionDiagnostics.js";
import type {
  GipSimulationOptions,
  GipSimulationOutcome,
  GipSimulationTarget,
} from "../simulation/GipSimulationError.js";
import type { ForkExecutionCall } from "../simulation/simulateGipOnFork.js";
import type { BatchTxs } from "../types.js";
import { lowerAddress } from "../utils/addressUtils.js";
import { buildPlanTransactions } from "./buildPlanTransactions.js";
import { CompileCache, KeyedCompileCache } from "./CompileCache.js";
import type { GipSdkRuntime } from "./GipSdkRuntime.js";
import { requireFork, simulateOnFork } from "./simulateOnFork.js";
import { snapshot } from "./snapshot.js";
import type {
  GipPlan,
  GipPlanBase,
  GipPlanGas,
  GipPreview,
  GipSourceSnapshot,
} from "./types.js";

/** Everything a scope derives from its recorded intent in one compilation. **/
export interface ScopeCompilation<TPreview extends GipPreview> {
  preview: TPreview;
  /** The GIP's own calls, in execution order. **/
  payloadCalls: RawTx[];
  /** Payload calls grouped to fit a block's gas limit. **/
  batches: BatchTxs[];
  /** `unavailable` when the scope has no per-action gas table. **/
  gasModel?: GipPlanGas["model"];
  /** Projected states a simulation compares the executed fork against. **/
  expected: Pick<
    GipSimulationTarget,
    "expectedMarkets" | "expectedConfigurator"
  >;
  /** Set when an action's `check` found an error: nothing can be built. **/
  blocked?: GipActionError;
}

/** The fields a scope adds to the plan fields every scope shares. **/
export type ScopePlanFields<TPlan extends GipPlan> = Omit<
  TPlan,
  keyof GipPlanBase
>;

/** What a builder had recorded when `preview`/`build`/`simulate` was called. **/
interface Capture<TIntent> {
  revision: number;
  intents: readonly TIntent[];
}

function toForkCall(tx: RawTx): ForkExecutionCall {
  return {
    to: tx.to,
    callData: tx.callData,
    value: tx.value,
    description: tx.description,
  };
}

/**
 * The lifecycle every scope builder shares.
 *
 * Recording is synchronous and chainable; `preview`, `build` and `simulate` are
 * asynchronous. Each of them captures the recorded intent at the moment it is
 * called, so intent recorded while it is still running does not leak into its
 * result. A compilation is cached per revision and shared by all three, and
 * everything handed out is deep-frozen.
 *
 * A scope supplies two things: how recorded intent compiles
 * ({@link ScopedBuilder.compile}) and which preview fields its plan carries
 * ({@link ScopedBuilder.planFields}).
 **/
export abstract class ScopedBuilder<
  TAction,
  TIntent,
  TPreview extends GipPreview,
  TPlan extends GipPlan,
> {
  readonly #runtime: GipSdkRuntime;
  readonly #intents: TIntent[];
  #revision = 0;
  readonly #compilations = new CompileCache<ScopeCompilation<TPreview>>();
  readonly #plans = new KeyedCompileCache<TPlan>();

  protected constructor(
    runtime: GipSdkRuntime,
    /** Intent recorded before the builder is handed out; not a revision. **/
    intents: readonly TIntent[] = [],
  ) {
    this.#runtime = runtime;
    this.#intents = intents.map(intent => snapshot(intent));
  }

  abstract get scope(): TPlan["scope"];

  get source(): GipSourceSnapshot {
    return this.#runtime.source;
  }

  /** Bumps on every recorded intent; compilations are cached per revision. **/
  get revision(): number {
    return this.#revision;
  }

  /**
   * Records one action of this scope. Actions of another scope are rejected at
   * compile time by the parameter type and at runtime by the scope guard, so
   * JSON input cannot slip past either.
   **/
  abstract addAction(action: TAction): this;

  /** Records several actions in order. **/
  addActions(actions: readonly TAction[]): this {
    for (const action of actions) this.addAction(action);
    return this;
  }

  /**
   * What was recorded, in order, as a frozen copy: the actions, and for the
   * market scope also the bundle applications.
   **/
  recordedActions(): readonly TIntent[] {
    return snapshot(this.#intents);
  }

  /** What the recorded intent resolves to, and the state it projects. **/
  preview(): Promise<TPreview> {
    const capture = this.#capture();
    return this.#compile(capture).then(({ preview }) => preview);
  }

  /**
   * A scope-discriminated plan with provenance, payloads and governor wrappers.
   *
   * @throws GipActionError when an action's `check` found an error
   **/
  build(args: { author: Address; eta: number }): Promise<TPlan> {
    return this.#build(this.#capture(), args);
  }

  /**
   * Executes this scope's payload on the SDK's Anvil node, independently of any
   * other scope, and compares the result with the projected state.
   *
   * Only an SDK created in fork mode can simulate. The payload is executed
   * directly, so neither an author nor an eta is needed.
   *
   * @throws GipActionError when an action's `check` found an error
   **/
  async simulate(
    options: GipSimulationOptions = {},
  ): Promise<GipSimulationOutcome> {
    const capture = this.#capture();
    // Checked first: a chain SDK is rejected before any projection work.
    const fork = requireFork(this.#runtime);
    const { payloadCalls, expected, blocked } = await this.#compile(capture);
    if (blocked) throw blocked;
    const { source } = this.#runtime;
    return simulateOnFork({
      fork,
      options,
      target: {
        chainId: source.chainId,
        marketConfigurator: source.marketConfigurator,
        sourceBlockNumber: source.blockNumber,
        sourceBlockHash: source.blockHash,
        calls: payloadCalls.map(toForkCall),
        ...expected,
        registry: this.#runtime.registry,
      },
    });
  }

  protected get runtime(): GipSdkRuntime {
    return this.#runtime;
  }

  /** Appends validated intent and starts a new revision. **/
  protected record(intent: TIntent): this {
    this.#intents.push(intent);
    this.#revision += 1;
    return this;
  }

  /** Resolves, projects and encodes the recorded intent. **/
  protected abstract compile(
    intents: readonly TIntent[],
  ): Promise<ScopeCompilation<TPreview>>;

  /** The preview fields this scope publishes on its plan, in plan order. **/
  protected abstract planFields(preview: TPreview): ScopePlanFields<TPlan>;

  #capture(): Capture<TIntent> {
    return { revision: this.#revision, intents: this.recordedActions() };
  }

  #compile(capture: Capture<TIntent>): Promise<ScopeCompilation<TPreview>> {
    return this.#compilations.run(capture.revision, () =>
      this.compile(capture.intents),
    );
  }

  #build(
    capture: Capture<TIntent>,
    args: { author: Address; eta: number },
  ): Promise<TPlan> {
    const author = lowerAddress(args.author);
    const { eta } = args;
    return this.#plans.run(capture.revision, `${author}:${eta}`, async () => {
      const { preview, payloadCalls, batches, gasModel, blocked } =
        await this.#compile(capture);
      if (blocked) throw blocked;
      const transactions = await buildPlanTransactions({
        runtime: this.#runtime,
        batches,
        payloadCalls,
        author,
        eta,
        gasModel,
      });
      return snapshot({
        planVersion: 1,
        scope: this.scope,
        source: preview.source,
        ...this.planFields(preview),
        incompleteChecks: preview.incompleteChecks,
        ...transactions,
      } as unknown as TPlan);
    });
  }
}
