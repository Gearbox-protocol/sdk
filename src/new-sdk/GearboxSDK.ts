import type { ChainId, NoticeSubject } from "../model/index.js";
import { GearboxAPI } from "../offchain/index.js";
import type {
  ILogger,
  MultichainAttachOptions,
  NetworkType,
  OnchainSDK,
} from "../sdk/index.js";
import { MultichainSDK, toChainIds } from "../sdk/index.js";
import { assertSameChains, MissingSourceError } from "./errors/index.js";
import type { Opportunities } from "./opportunities/index.js";
import { OpportunitiesNamespace } from "./opportunities/index.js";
import type { Positions } from "./positions/index.js";
import { PositionsNamespace } from "./positions/index.js";
import type {
  GearboxSDKOptions,
  Mode,
  NamespaceOptions,
  NoticesByMode,
  OffchainByMode,
  OnchainByMode,
  PlainMultichainSDKOptions,
} from "./types.js";
import { DEFAULT_MAX_OFFCHAIN_LAG } from "./utils/index.js";

/**
 * Default {@link GearboxSDKOptions.maxStateAgeSeconds}: the fastest poll an
 * app runs, so a 30 s tick sees state no older than itself.
 **/
export const DEFAULT_MAX_STATE_AGE = 30;

/**
 * Entry point over both sources of Gearbox data: the chain and the Gearbox
 * backend. The {@link Mode} is fixed at construction and decides which methods
 * exist.
 *
 * ```ts
 * const sdk = new GearboxSDK({
 *   mode: "both",
 *   networks: ["Mainnet"],
 *   onchain: { chains: { Mainnet: { rpcURLs } } },
 *   offchain: { baseUrl: "https://api.gearbox.fi" },
 * });
 * await sdk.attach();
 *
 * const { data, meta } = await sdk.opportunities.list({ kind: "strategy" });
 * ```
 *
 * @typeParam M - Mode the instance was built in.
 **/
export class GearboxSDK<const M extends Mode = Mode> {
  /**
   * Sources this instance reads from.
   **/
  public readonly mode: M;
  /**
   * Chains this instance covers, which every read is scoped to.
   **/
  public readonly networks: readonly NetworkType[];
  /**
   * Namespace for pool and strategy opportunities.
   **/
  public readonly opportunities: Opportunities<M>;
  /**
   * Namespace for the positions a wallet holds.
   **/
  public readonly positions: Positions<M>;

  readonly #attachOptions?: MultichainAttachOptions;
  readonly #onchain?: MultichainSDK;
  readonly #offchain?: GearboxAPI;
  readonly #ownsOnchain: boolean = false;
  readonly #maxStateAgeSeconds: number;
  readonly #logger?: ILogger;

  /**
   * The banners the backend attaches to a pool opportunity or a strategy
   * position, see {@link Notice}. Top-level because the subject is either
   * kind of entity, so neither namespace owns it. Backend-only, hence gated
   * by mode like every other backend read: absent in `onchain` mode.
   **/
  public readonly notices: NoticesByMode[M];

  #attached: boolean;
  /** The one attach in flight, shared by {@link attach} and every first read. */
  #attaching?: Promise<void>;
  /** One sync in flight per chain: concurrent stale reads join it. */
  readonly #syncing = new Map<ChainId, Promise<void>>();

  constructor(options: GearboxSDKOptions<M>) {
    const {
      mode,
      networks,
      onchain,
      offchain,
      attach,
      logger,
      maxOffchainLagSeconds = DEFAULT_MAX_OFFCHAIN_LAG,
      maxStateAgeSeconds = DEFAULT_MAX_STATE_AGE,
    } = options;

    this.mode = mode;
    this.networks = [...networks];
    this.#attachOptions = attach;
    this.#maxStateAgeSeconds = maxStateAgeSeconds;
    this.#logger = logger;

    const needsOnchain = mode === "onchain" || mode === "both";
    const needsOffchain = mode === "offchain" || mode === "both";

    if (needsOnchain && !onchain) {
      throw new MissingSourceError(mode, "onchain");
    }
    if (needsOffchain && !offchain) {
      throw new MissingSourceError(mode, "offchain");
    }
    if (!needsOnchain && onchain) {
      logger?.warn(
        `GearboxSDK in ${mode} mode ignores the onchain source it was given`,
      );
    }
    if (!needsOffchain && offchain) {
      logger?.warn(
        `GearboxSDK in ${mode} mode ignores the offchain source it was given`,
      );
    }

    const chainIds = toChainIds(networks);
    if (needsOnchain && onchain) {
      if (onchain instanceof MultichainSDK) {
        this.#onchain = onchain;
      } else {
        this.#onchain = new MultichainSDK({
          logger,
          ...onchain,
          chains: chainsOf(onchain.chains, networks),
        });
        this.#ownsOnchain = true;
      }
      assertSameChains("onchain", networks, [...this.#onchain.chains.keys()]);
    }
    if (needsOffchain && offchain) {
      if (offchain instanceof GearboxAPI) {
        assertSameChains("offchain", chainIds, offchain.chainIds);
        this.#offchain = offchain;
      } else {
        this.#offchain = new GearboxAPI({ logger, ...offchain, chainIds });
      }
    }

    // an injected on-chain SDK is ready to read from; one built here is not
    // until `attach` resolves
    this.#attached = !this.#ownsOnchain;

    const namespaceOptions: NamespaceOptions = {
      maxOffchainLagSeconds,
      ensureFresh: this.#onchain
        ? chainIds => this.#ensureFresh(chainIds)
        : undefined,
      logger,
    };
    // the namespaces hand out these two sources' own sub-namespaces (the
    // on-chain one behind the loading policy), so `sdk.opportunities.onchain`
    // and `sdk.onchain.opportunities` cannot drift
    this.opportunities = new OpportunitiesNamespace(
      this.#onchain,
      this.#offchain,
      namespaceOptions,
    ) as Opportunities<M>;
    this.positions = new PositionsNamespace(
      this.#onchain,
      this.#offchain,
      namespaceOptions,
    ) as Positions<M>;
    const backend = this.#offchain;
    this.notices = (
      backend
        ? (subject: NoticeSubject) => backend.notices.list(subject)
        : undefined
    ) as NoticesByMode[M];
  }

  /**
   * Attaches the on-chain SDK when this instance owns one; a no-op in `offchain`
   * mode and when an already-attached SDK was injected.
   **/
  public async attach(): Promise<void> {
    return this.#ensureAttached();
  }

  /**
   * The attach every async read awaits: the first caller starts it, later
   * ones join the same promise; a rejected attach is not cached, so the next
   * read retries.
   **/
  async #ensureAttached(): Promise<void> {
    if (this.#attached || !this.#ownsOnchain || !this.#onchain) {
      return;
    }
    if (!this.#attaching) {
      const onchain = this.#onchain;
      this.#attaching = onchain
        .attach(this.#attachOptions)
        .then(() => {
          this.#attached = true;
        })
        .finally(() => {
          this.#attaching = undefined;
        });
    }
    return this.#attaching;
  }

  /**
   * What every on-chain leg of an async read awaits: the source attached, and
   * the chains the read touches (all of them when unnamed) synced when their
   * loaded state is older than `maxStateAgeSeconds`. A sync that fails leaves
   * the previous state to be served — its age tells the consumer it is stale.
   **/
  async #ensureFresh(chainIds?: readonly ChainId[]): Promise<void> {
    await this.#ensureAttached();
    const onchain = this.#onchain;
    if (!onchain) {
      return;
    }
    const wanted = chainIds && new Set(chainIds);
    const stale: OnchainSDK[] = [];
    const now = Math.floor(Date.now() / 1000);
    for (const chain of onchain.chains.values()) {
      if (wanted && !wanted.has(chain.chainId)) {
        continue;
      }
      if (now - Number(chain.timestamp) > this.#maxStateAgeSeconds) {
        stale.push(chain);
      }
    }
    await Promise.all(stale.map(chain => this.#sync(chain)));
  }

  #sync(chain: OnchainSDK): Promise<void> {
    const inFlight = this.#syncing.get(chain.chainId);
    if (inFlight) {
      return inFlight;
    }
    const sync = chain
      .syncState()
      .then(() => undefined)
      .catch(error => {
        this.#logger?.warn(
          error,
          `failed to sync chain ${chain.chainId}; serving state of block ${chain.currentBlock}`,
        );
      })
      .finally(() => {
        this.#syncing.delete(chain.chainId);
      });
    this.#syncing.set(chain.chainId, sync);
    return sync;
  }

  /**
   * Whether the on-chain source is ready to be read from. Always `true` in
   * `offchain` mode.
   **/
  public get attached(): boolean {
    return this.mode === "offchain" ? true : this.#attached;
  }

  /**
   * The underlying on-chain SDK, for everything this facade does not expose
   * yet: markets, credit accounts, transaction building. `undefined` in
   * `offchain` mode, and only answers reads once {@link attach} has resolved.
   **/
  public get onchain(): OnchainByMode[M] {
    return this.#onchain as OnchainByMode[M];
  }

  /**
   * The underlying backend client. `undefined` in `onchain` mode.
   **/
  public get offchain(): OffchainByMode[M] {
    return this.#offchain as OffchainByMode[M];
  }
}

/**
 * Per-chain configuration of exactly the networks the SDK covers.
 **/
// a chain configured beyond them is left unbuilt rather than quietly read from,
// which is what makes `sdk.opportunities.onchain.list()` scoped without anyone
// threading a chain list into it
function chainsOf(
  configured: PlainMultichainSDKOptions["chains"],
  networks: readonly NetworkType[],
): PlainMultichainSDKOptions["chains"] {
  const chains: PlainMultichainSDKOptions["chains"] = {};
  for (const network of networks) {
    const chain = configured[network];
    if (!chain) {
      throw new Error(
        `GearboxSDK covers ${network}, but its onchain source has no configuration for it`,
      );
    }
    chains[network] = chain;
  }
  return chains;
}
