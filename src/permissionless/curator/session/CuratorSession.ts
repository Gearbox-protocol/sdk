import {
  type Address,
  type Chain,
  createPublicClient,
  type Hex,
  http,
  type PublicClient,
  type Transport,
} from "viem";
import {
  type GearboxState,
  getChain,
  type OnchainSDK,
} from "../../../onchain/index.js";
import type { MarketConfiguratorContract } from "../../bindings/market-configurator.js";
import type { CreateMarketParams } from "../actions/actionTypes.js";
import type { CreateMarketAction } from "../actions/createMarketActionData.js";
import { GipRegistry } from "../GipRegistry.js";
import type { AdapterPluginDefinition } from "../plugins/adapters/defineAdapterPlugin.js";
import type { ConfiguratorState } from "../state/configurator/types.js";
import type { MarketState } from "../state/market/types.js";
import { lowerAddress } from "../utils/addressUtils.js";
import { parseMarketScopedAction } from "./actionScope.js";
import { ConfiguratorBuilder } from "./ConfiguratorBuilder.js";
import {
  DEFAULT_FORK_TIMEOUT_MS,
  type GipAnvilForkOptions,
  normalizeRpcUrl,
} from "./forkConnection.js";
import { GipSdkRuntime } from "./GipSdkRuntime.js";
import { MarketBuilder } from "./MarketBuilder.js";
import { snapshot } from "./snapshot.js";
import type { GipSourceSnapshot, StateProvenance } from "./types.js";

/** Everything a session is created with, apart from its connection. **/
export interface CuratorSessionOptions {
  marketConfigurator: Address;
  /**
   * Block every initial read, projection and dependency is resolved at.
   * Defaults to the chain head when the session is created, and is then fixed for
   * the session's whole lifetime.
   **/
  blockNumber?: bigint | number;
  /** Reuse in chain mode; copy its state into a fork-bound SDK in fork mode. **/
  sdk?: OnchainSDK;
  /** Hydrate a new `OnchainSDK` from this snapshot instead of reading the chain. **/
  sdkState?: GearboxState;
  /** Decimals overrides; they win over SDK metadata and on-chain reads. **/
  tokenDecimals?: Record<string, number>;
  /** Gas limit for read-only `eth_call`s made through the SDK. **/
  gasLimit?: bigint;
  /**
   * Adapter plugins defined outside the package, declared with
   * `defineAdapterPlugin`. Their adapters can be allowed with
   * `CREDIT::allowAdapter` and configured with their actions; markets using
   * them are read and diffed with their state schema.
   *
   * @throws when a plugin's adapter type, or one of its action types, is
   * already registered
   **/
  plugins?: readonly AdapterPluginDefinition[];
}

/** Choose a chain client OR an Anvil URL. Fork mode owns its RPC connection. **/
export type CuratorSessionArgs = CuratorSessionOptions &
  (
    | { client: PublicClient<Transport, Chain>; fork?: never }
    | { fork: GipAnvilForkOptions; client?: never }
  );

/**
 * A curator's working session: one chain, one MarketConfigurator, one block.
 *
 * Everything it produces refers to that source block and its timestamp, so
 * previews and plans are reproducible and do not drift with the chain head or
 * `Date.now()`. A session hands out builders — {@link market},
 * {@link configurator}, {@link newMarket} — that record a GIP's intent and
 * compile it into previews, plans and fork simulations.
 *
 * ```ts
 * const session = await CuratorSession.create({ client, marketConfigurator });
 * const plan = await session
 *   .market({ pool })
 *   .addAction({ type: "POOL::setTotalDebtLimit", params: { limit: 5_000_000 } })
 *   .build({ author, eta });
 * ```
 **/
export class CuratorSession {
  readonly mode: "chain" | "fork";
  /** Present only in fork mode; copied and frozen at creation. **/
  readonly fork: GipAnvilForkOptions | undefined;
  /** The one chain, configurator and block this session is scoped to. **/
  readonly source: GipSourceSnapshot;
  /** Unpinned client: caller-supplied in chain mode, fork-owned in fork mode. **/
  readonly client: PublicClient<Transport, Chain>;
  /** Client whose reads default to {@link GipSourceSnapshot.blockNumber}. **/
  readonly readClient: PublicClient<Transport, Chain>;
  readonly marketConfigurator: MarketConfiguratorContract;
  /** The built-in action definitions and adapter plugins, plus `plugins`. **/
  readonly registry: GipRegistry;

  readonly #runtime: GipSdkRuntime;
  /** Provenance of a state the session reads itself. **/
  readonly #readProvenance: StateProvenance;
  /** Provenance of a market state read through the session's OnchainSDK. **/
  readonly #marketReadProvenance: StateProvenance;

  private constructor(args: {
    runtime: GipSdkRuntime;
    client: PublicClient<Transport, Chain>;
    suppliedSdkState: boolean;
  }) {
    const { runtime } = args;
    this.#runtime = runtime;
    this.mode = runtime.fork ? "fork" : "chain";
    this.fork = runtime.fork;
    this.source = runtime.source;
    this.client = args.client;
    this.readClient = runtime.readClient;
    this.marketConfigurator = runtime.marketConfigurator;
    this.registry = runtime.registry;
    this.#readProvenance = runtime.fork ? "fork-read" : "chain-read";
    this.#marketReadProvenance = args.suppliedSdkState
      ? "caller-supplied-sdk-state"
      : this.#readProvenance;
  }

  /**
   * Opens a session on a chain client or on an Anvil fork, pinned to
   * `blockNumber` (the head by default; a fork's current block in fork mode).
   *
   * @throws when a plugin's adapter or action type is already registered
   **/
  static async create(args: CuratorSessionArgs): Promise<CuratorSession> {
    assertArgs(args);
    const registry = GipRegistry.builtin.extend(args.plugins ?? []);

    // A fork session never reuses a supplied SDK's connection: only its state
    // is kept and rehydrated on the fork client.
    const sdkState =
      args.fork && args.sdk
        ? snapshot(args.sdk.state)
        : args.sdkState
          ? snapshot(args.sdkState)
          : undefined;
    const fork = resolveForkOptions(args.fork);
    const client = fork ? await connectToFork(fork) : args.client;
    // `assertArgs` establishes this even for untyped JavaScript callers.
    if (!client) throw new Error("No curator session client was configured");

    const source = await readSource(client, args, fork !== undefined);
    const runtime = new GipSdkRuntime({
      client,
      source,
      fork,
      sdk: fork ? undefined : args.sdk,
      sdkState,
      tokenDecimals: args.tokenDecimals,
      gasLimit: args.gasLimit,
      registry,
    });
    return new CuratorSession({
      runtime,
      client,
      suppliedSdkState: Boolean(args.sdkState || args.sdk),
    });
  }

  /**
   * A builder for ONE existing market.
   *
   * `{ pool }` loads the market state from the chain at the source block.
   * `{ initialState }` uses the supplied state as-is and never replaces it with
   * an on-chain read (other reads, e.g. deployment previews, still happen).
   **/
  market(
    args:
      | { pool: Address; initialState?: MarketState }
      | { initialState: MarketState; pool?: Address },
  ): MarketBuilder {
    const { pool, initialState } = args;
    if (!pool && !initialState) {
      throw new Error(
        "session.market() needs { pool } or { initialState }; use session.newMarket() to create a market",
      );
    }
    return new MarketBuilder({
      runtime: this.#runtime,
      pool: pool || undefined,
      initialState,
      provenance: initialState ? "caller-supplied" : this.#marketReadProvenance,
    });
  }

  /** A builder for the entities every market of this configurator shares. **/
  configurator(args?: {
    initialState?: ConfiguratorState;
  }): ConfiguratorBuilder {
    const initialState = args?.initialState;
    return new ConfiguratorBuilder({
      runtime: this.#runtime,
      initialState,
      provenance: initialState ? "caller-supplied" : this.#readProvenance,
    });
  }

  /** A market builder that starts by creating the market. **/
  newMarket(params: CreateMarketParams): MarketBuilder {
    // Normalized through the same schema as any other recorded action.
    const action = parseMarketScopedAction(
      { type: "MARKET::createMarket", params },
      this.registry,
    ) as CreateMarketAction;
    return new MarketBuilder({
      runtime: this.#runtime,
      intents: [{ kind: "action", action }],
      provenance: "new-market",
    });
  }

  /** The `OnchainSDK` used for reads; fork mode always binds it to the fork URL. **/
  onchainSdk(): Promise<OnchainSDK> {
    return this.#runtime.onchainSdk();
  }
}

type Client = PublicClient<Transport, Chain>;

/** Rejects argument combinations the types already forbid, for JS callers. **/
function assertArgs(args: CuratorSessionArgs): void {
  if (args.fork && args.client) {
    throw new Error(
      "Pass either client or fork to CuratorSession.create, not both",
    );
  }
  if (!args.fork && !args.client) {
    throw new Error(
      "CuratorSession.create requires a client or { fork: { rpcUrl } }",
    );
  }
  if (args.sdk && args.sdkState) {
    throw new Error(
      "Pass either sdk or sdkState to CuratorSession.create, not both",
    );
  }
  if (args.sdk && !args.sdk.attached) {
    throw new Error("The OnchainSDK must already be attached or hydrated");
  }
}

/** The fork options as the SDK keeps them: normalized, validated and frozen. **/
function resolveForkOptions(
  fork: GipAnvilForkOptions | undefined,
): GipAnvilForkOptions | undefined {
  if (!fork) return undefined;
  const options = snapshot<GipAnvilForkOptions>({
    rpcUrl: normalizeRpcUrl(fork.rpcUrl),
    ...(fork.timeoutMs !== undefined ? { timeoutMs: fork.timeoutMs } : {}),
  });
  if (
    options.timeoutMs !== undefined &&
    (!Number.isFinite(options.timeoutMs) || options.timeoutMs <= 0)
  ) {
    throw new Error("fork.timeoutMs must be a positive finite number");
  }
  return options;
}

/**
 * Client for an Anvil fork. The SDK owns this connection: the node is probed
 * first so that anything other than Anvil is rejected before it is used.
 **/
async function connectToFork(fork: GipAnvilForkOptions): Promise<Client> {
  const transport = () =>
    http(fork.rpcUrl, { timeout: fork.timeoutMs ?? DEFAULT_FORK_TIMEOUT_MS });

  const probe = createPublicClient({ transport: transport() });
  try {
    const info = await probe.request({ method: "anvil_nodeInfo" } as never, {
      retryCount: 0,
    });
    if (!info || typeof info !== "object") {
      throw new Error("Invalid anvil_nodeInfo response");
    }
  } catch (cause) {
    throw new Error(
      "Fork mode requires an Anvil node supporting anvil_nodeInfo",
      { cause },
    );
  }

  return createPublicClient({
    chain: getChain(await probe.getChainId()),
    transport: transport(),
  }) as Client;
}

/**
 * Pins the SDK to one block. A chain SDK may pick any block and defaults to the
 * head; a fork SDK describes the node as it is, so only its current block fits.
 **/
async function readSource(
  client: Client,
  args: Pick<CuratorSessionArgs, "marketConfigurator" | "blockNumber">,
  isFork: boolean,
): Promise<GipSourceSnapshot> {
  const chainId = client.chain?.id ?? (await client.getChainId());
  const head = isFork ? await client.getBlockNumber() : undefined;
  const blockNumber =
    args.blockNumber !== undefined
      ? BigInt(args.blockNumber)
      : (head ?? (await client.getBlockNumber()));
  if (isFork && blockNumber !== head) {
    throw new Error(
      "Fork mode must use the Anvil node's current block; fork the node at the desired block before creating the session",
    );
  }
  const block = await client.getBlock({ blockNumber });
  if (!block.hash) {
    throw new Error(`Source block ${blockNumber} has no canonical hash`);
  }
  return snapshot<GipSourceSnapshot>({
    chainId,
    marketConfigurator: lowerAddress(args.marketConfigurator),
    blockNumber,
    blockHash: block.hash as Hex,
    blockTimestamp: Number(block.timestamp),
  });
}
