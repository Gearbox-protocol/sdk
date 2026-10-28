import type { Address } from "viem";
import type { RawTx } from "../../../onchain/index.js";
import { GipActionError } from "../actions/actionDiagnostics.js";
import type { GipMarketAction } from "../actions/types.js";
import { sharedContract } from "../actions/utils/actionKeys.js";
import {
  type MarketExecution,
  MarketExecutor,
} from "../executor/MarketExecutor.js";
import type { GipRegistry } from "../GipRegistry.js";
import type {
  GipSimulationOptions,
  GipSimulationOutcome,
} from "../simulation/GipSimulationError.js";
import type { PeripheryState } from "../state/market/types.js";
import { batchMarketTransactions } from "../transactions/batchMarketTransactions.js";
import type { BatchTxs } from "../types.js";
import { isSameAddress, lowerAddress } from "../utils/addressUtils.js";
import { stableStringify } from "../utils/objectUtils.js";
import {
  buildPlanTransactions,
  type GipPlanTransactions,
} from "./buildPlanTransactions.js";
import { KeyedCompileCache } from "./CompileCache.js";
import { collectGipDiagnostics } from "./collectGipDiagnostics.js";
import type { GipSdkRuntime } from "./GipSdkRuntime.js";
import {
  diagnosticMarket,
  type MarketBuilder,
  marketPreview,
  type PreparedMarket,
} from "./MarketBuilder.js";
import { requireFork, simulateOnFork } from "./simulateOnFork.js";
import { snapshot } from "./snapshot.js";
import type {
  GipSourceSnapshot,
  IncompleteCheck,
  MarketDiagnostic,
  MarketIntent,
  MarketPreview,
} from "./types.js";

/** One GIP over several markets, as {@link MergedGip.preview} compiles it. **/
export interface MergedGipPreview {
  source: GipSourceSnapshot;
  eta: number;
  /** The preview of each merged builder, in the order they were merged. **/
  markets: readonly MarketPreview[];
  /** Pools in the order their calls execute. **/
  executionOrder: readonly Address[];
  /** Every market's payload calls, in execution order, grouped into batches. **/
  batches: readonly BatchTxs[];
  /** `getGipDiagnostics` findings for the whole proposal. **/
  diagnostics: readonly MarketDiagnostic[];
  /** Whole-proposal checks that could not complete; markets report their own. **/
  incompleteChecks: readonly IncompleteCheck[];
}

/** A merged GIP with governance wrappers generated once for all markets. **/
export type MergedGipPlan = MergedGipPreview & GipPlanTransactions;

interface Compilation {
  preview: MergedGipPreview;
  /** Every market's payload calls, in execution order. **/
  payloadCalls: RawTx[];
}

/**
 * Market builders merged into one GIP.
 *
 * Markets share nothing but configurator periphery. They execute one after
 * another, each seeing the periphery the earlier ones deployed or registered:
 * a market waits for the markets providing periphery it requires, and a
 * periphery call listed by several markets runs once.
 *
 * The builders stay live: like a builder's own `preview`, each call compiles
 * the intent recorded at the moment it is called.
 **/
export class MergedGip {
  readonly #runtime: GipSdkRuntime;
  readonly #markets: readonly MarketBuilder[];
  readonly #compilations = new KeyedCompileCache<Compilation>();

  constructor(runtime: GipSdkRuntime, markets: readonly MarketBuilder[]) {
    if (markets.length === 0)
      throw new Error("A merged GIP needs at least one market builder");
    if (markets.some(market => market.source !== runtime.source))
      throw new Error("Merged market builders must come from the same session");
    this.#runtime = runtime;
    this.#markets = [...markets];
  }

  get source(): GipSourceSnapshot {
    return this.#runtime.source;
  }

  /** What the merged markets project, and the batches they execute in. **/
  preview(options: { eta?: number } = {}): Promise<MergedGipPreview> {
    return this.#compile(options.eta).then(({ preview }) => preview);
  }

  /**
   * Governance transactions for the whole proposal, built after batching it.
   *
   * @throws GipActionError when an action's `check` found an error
   **/
  async build(args: { author: Address; eta: number }): Promise<MergedGipPlan> {
    const { preview, payloadCalls } = await this.#compile(args.eta);
    assertNotBlocked(preview);
    const transactions = await buildPlanTransactions({
      runtime: this.#runtime,
      batches: preview.batches,
      payloadCalls,
      author: lowerAddress(args.author),
      eta: preview.eta,
    });
    return snapshot({ ...preview, ...transactions });
  }

  /**
   * Executes the whole proposal on the session's Anvil node and compares every
   * market with its projected state. See `MarketBuilder.simulate`.
   *
   * @throws GipActionError when an action's `check` found an error
   **/
  async simulate(
    options: GipSimulationOptions = {},
  ): Promise<GipSimulationOutcome> {
    const fork = requireFork(this.#runtime);
    const { preview, payloadCalls } = await this.#compile(options.eta);
    assertNotBlocked(preview);
    return simulateOnFork({
      runtime: this.#runtime,
      fork,
      options,
      eta: preview.eta,
      payloadCalls,
      expected: {
        expectedMarkets: preview.markets.map(market => ({
          address: market.after.address,
          after: market.after,
        })),
      },
    });
  }

  #compile(requestedEta?: number): Promise<Compilation> {
    const eta = this.#runtime.eta(requestedEta);
    // Captured now, so intent recorded while compiling does not leak in.
    const intents = this.#markets.map(market => market.recordedActions());
    // @dev revisions only grow, so their sum changes with any recorded intent
    const revision = this.#markets.reduce(
      (sum, market) => sum + market.revision,
      0,
    );
    return this.#compilations.run(revision, String(eta), () =>
      compile(this.#runtime, this.#markets, intents, eta),
    );
  }
}

async function compile(
  runtime: GipSdkRuntime,
  builders: readonly MarketBuilder[],
  intents: readonly (readonly MarketIntent[])[],
  eta: number,
): Promise<Compilation> {
  const prepared = await Promise.all(
    builders.map((builder, index) => builder.prepare(intents[index], eta)),
  );
  const footprints = prepared.map(market =>
    sharedFootprint(runtime.registry, market.actions),
  );
  const order = executionOrder(footprints);

  const periphery = new Map<Address, PeripheryState>();
  const performed = new Set<string>();
  const executed: { prepared: PreparedMarket; changes: MarketExecution }[] = [];
  for (const index of order) {
    const { provides, requires } = footprints[index];
    const uses = new Set([...provides, ...requires].map(sharedContract));
    const actions = prepared[index].actions.filter(action => {
      const call = peripheryCall(action);
      return call === undefined || !performed.has(call);
    });
    const executor = new MarketExecutor(runtime.ctx, {
      ...runtime.executorOptions(eta),
      periphery: [...periphery.values()].filter(entry =>
        uses.has(lowerAddress(entry.address)),
      ),
    });
    const changes = await executor.execute(
      prepared[index].initialState,
      actions,
    );
    executed[index] = { prepared: { ...prepared[index], actions }, changes };

    for (const entry of changes.after.periphery ?? [])
      periphery.set(lowerAddress(entry.address), entry);
    for (const action of changes.resolvedActions) {
      const call = peripheryCall(action);
      if (call !== undefined) performed.add(call);
    }
  }

  const pools = executed.map(({ changes }) =>
    lowerAddress(changes.after.address),
  );
  if (new Set(pools).size < pools.length)
    throw new Error("A pool occurs more than once in the GIP");

  const found = await collectGipDiagnostics({
    runtime,
    markets: executed.map(({ prepared, changes }) =>
      diagnosticMarket(prepared.actions, changes),
    ),
  });
  const markets = executed.map(({ prepared, changes }) =>
    marketPreview({
      runtime,
      eta,
      prepared,
      changes,
      found: {
        diagnostics: found.diagnostics.filter(
          diagnostic =>
            diagnostic.market !== undefined &&
            isSameAddress(diagnostic.market.address, changes.after.address),
        ),
        incompleteChecks: [],
      },
    }),
  );
  const txs = order.flatMap(index => executed[index].changes.txs);
  return {
    preview: snapshot<MergedGipPreview>({
      source: runtime.source,
      eta,
      markets,
      executionOrder: order.map(index => pools[index]),
      batches: batchMarketTransactions({
        chainId: runtime.source.chainId,
        txs,
      }),
      diagnostics: found.diagnostics,
      incompleteChecks: found.incompleteChecks,
    }),
    payloadCalls: txs.map(({ tx }) => tx),
  };
}

/** The first blocked market rejects the whole proposal. **/
function assertNotBlocked(preview: MergedGipPreview): void {
  const blocked = preview.markets.find(
    market => market.blockedAt !== undefined,
  );
  if (blocked) throw new GipActionError([...blocked.actionDiagnostics]);
}

/** The configurator-wide resources a market provides and requires. **/
interface Footprint {
  provides: Set<string>;
  requires: Set<string>;
}

function sharedFootprint(
  registry: GipRegistry,
  actions: readonly GipMarketAction[],
): Footprint {
  const shared = (side: keyof Footprint) =>
    new Set(
      actions
        .flatMap(
          action =>
            registry.requireMarketAction(action.type)[side]?.(action.params) ??
            [],
        )
        .filter(name => sharedContract(name) !== undefined),
    );
  return { provides: shared("provides"), requires: shared("requires") };
}

/**
 * Input order, except that a market waits for the other markets providing
 * periphery it requires: a contract is deployed before it is registered, and a
 * Degen NFT is registered before a credit suite or facade uses it.
 **/
function executionOrder(markets: readonly Footprint[]): number[] {
  const pending = markets.map((_, index) => index);
  const ordered: number[] = [];
  while (pending.length > 0) {
    const next = pending.findIndex(index =>
      [...markets[index].requires].every(
        name =>
          markets[index].provides.has(name) ||
          !pending.some(other => markets[other].provides.has(name)),
      ),
    );
    if (next === -1)
      throw new Error("Cyclic shared periphery dependencies between markets");
    ordered.push(...pending.splice(next, 1));
  }
  return ordered;
}

/**
 * Identity of a periphery call. Deployments and registrations do not depend on
 * the market, so the same call listed by two markets is one call.
 **/
function peripheryCall(action: GipMarketAction): string | undefined {
  // @dev addresses may differ in checksum case only
  return action.type === "BCR::deployContract" ||
    action.type === "MARKET::addPeripheryContract"
    ? `${action.type}:${stableStringify(action.params).toLowerCase()}`
    : undefined;
}
