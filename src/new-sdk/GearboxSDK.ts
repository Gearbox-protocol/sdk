import { GearboxAPI } from "../offchain/index.js";
import type { MultichainAttachOptions, NetworkType } from "../sdk/index.js";
import { MultichainSDK, toChainIds } from "../sdk/index.js";
import { DEFAULT_MAX_OFFCHAIN_LAG } from "./merge/index.js";
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

/**
 * Combined entry point over both sources of Gearbox data: the chain and the
 * Gearbox backend.
 *
 * The {@link Mode} is fixed at construction and decides which methods exist,
 * not what they return, so a screen written against `both` cannot silently
 * degrade to a subset when someone reconfigures the SDK:
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
 * Every read answers with `{ data, meta }`: `meta` says, per chain, which source
 * served it and which block it reflects, because a partial answer is the normal
 * case for a multi-chain read.
 *
 * In `both` mode a read asks both sources at once and each chain is served by
 * whichever is fresh enough. A consumer that would rather paint the backend's
 * answer first and the chain's when it arrives reads the two branches itself —
 * `sdk.opportunities.offchain` and `sdk.opportunities.onchain` — and combines
 * them with `sdk.opportunities.merge.list`, which is the same policy `both` mode
 * applies internally.
 *
 * @typeParam M - Mode the instance was built in.
 **/
export class GearboxSDK<const M extends Mode = Mode> {
  /**
   * Sources this instance reads from.
   **/
  public readonly mode: M;
  /**
   * Chains this instance covers. Both of its sources cover exactly these, so
   * every read is scoped to them, branch reads included.
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
  /**
   * Whether this instance built the on-chain SDK, and therefore attaches it.
   **/
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
      throw new Error(`GearboxSDK in ${mode} mode needs an onchain source`);
    }
    if (needsOffchain && !offchain) {
      throw new Error(`GearboxSDK in ${mode} mode needs an offchain source`);
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

    // one conversion for the whole SDK: nothing below this line names a chain
    // by label again
    const chainIds = toChainIds(networks);

    if (needsOnchain && onchain) {
      if (onchain instanceof MultichainSDK) {
        // an injected instance belongs to its owner: it is used as it is, and
        // never attached or synced from here, so it has to already cover what
        // this SDK claims to
        const covered = [...onchain.chains.keys()];
        if (
          covered.length !== networks.length ||
          covered.some(network => !networks.includes(network))
        ) {
          throw new Error(
            `GearboxSDK covers ${networks.join(", ")}, but the onchain SDK it was given covers ${covered.join(", ") || "no chain"}`,
          );
        }
        this.#onchain = onchain;
      } else {
        this.#onchain = new MultichainSDK({
          logger,
          ...onchain,
          chains: chainsOf(onchain.chains, networks),
        });
        this.#ownsOnchain = true;
      }
    }
    if (needsOffchain && offchain) {
      if (offchain instanceof GearboxAPI) {
        const covered = offchain.chainIds;
        if (
          covered.length !== chainIds.length ||
          covered.some(chainId => !chainIds.includes(chainId))
        ) {
          throw new Error(
            `GearboxSDK covers chains ${chainIds.join(", ")}, but the backend client it was given covers ${covered.join(", ") || "no chain"}`,
          );
        }
        this.#offchain = offchain;
      } else {
        this.#offchain = new GearboxAPI({ logger, ...offchain, chainIds });
      }
    }

    // an injected on-chain SDK is ready to read from; one built here is not
    // until `attach` resolves
    this.#attached = !this.#ownsOnchain;

    const namespaceOptions: NamespaceOptions = {
      chainIds,
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
   * Attaches the on-chain SDK when this instance owns one.
   *
   * Reads issued before this resolves still reach the chain and fail there, so
   * in `both` mode they are served from the backend alone and report the chain
   * as failed in their meta, rather than blocking.
   *
   * A no-op in `offchain` mode and when an already-attached SDK was injected.
   **/
  public async attach(): Promise<void> {
    if (this.#attached || !this.#ownsOnchain || !this.#onchain) {
      return;
    }
    await this.#onchain.attach(this.#attachOptions);
    this.#attached = true;
  }

  /**
   * Whether the on-chain source is ready to be read from. Always `true` in
   * `offchain` mode, where there is nothing to wait for.
   **/
  public get attached(): boolean {
    return this.mode === "offchain" ? true : this.#attached;
  }

  /**
   * The underlying on-chain SDK, for everything this facade does not expose
   * yet: markets, credit accounts, transaction building.
   *
   * `undefined` in `offchain` mode. Otherwise it exists from construction on,
   * but only answers reads once {@link attach} has resolved.
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
 *
 * A chain configured beyond them is left unbuilt rather than quietly read from,
 * which is what makes `sdk.opportunities.onchain.list()` scoped without anyone
 * threading a chain list into it.
 **/
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
