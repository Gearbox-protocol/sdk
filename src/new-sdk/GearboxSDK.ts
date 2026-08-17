import { GearboxAPI } from "../offchain/index.js";
import type { MultichainAttachOptions, NetworkType } from "../sdk/index.js";
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
  OffchainByMode,
  OnchainByMode,
  PlainMultichainSDKOptions,
} from "./types.js";
import { DEFAULT_MAX_OFFCHAIN_LAG } from "./utils/index.js";

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

  #attached: boolean;

  constructor(options: GearboxSDKOptions<M>) {
    const {
      mode,
      networks,
      onchain,
      offchain,
      attach,
      logger,
      maxOffchainLagSeconds = DEFAULT_MAX_OFFCHAIN_LAG,
    } = options;

    this.mode = mode;
    this.networks = [...networks];
    this.#attachOptions = attach;

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
      logger,
    };
    // the namespaces hand out the very sub-namespaces of these two sources, so
    // `sdk.opportunities.onchain` and `sdk.onchain.opportunities` are one object
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
  }

  /**
   * Attaches the on-chain SDK when this instance owns one; a no-op in `offchain`
   * mode and when an already-attached SDK was injected.
   **/
  // reads issued before this resolves still reach the chain and fail there, so in
  // `both` mode they are served from the backend alone rather than blocking
  public async attach(): Promise<void> {
    if (this.#attached || !this.#ownsOnchain || !this.#onchain) {
      return;
    }
    await this.#onchain.attach(this.#attachOptions);
    this.#attached = true;
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
