import { GearboxAPI } from "../offchain/index.js";
import type { MultichainAttachOptions, NetworkType } from "../sdk/index.js";
import { MultichainSDK } from "../sdk/index.js";
import type { Opportunities } from "./opportunities/index.js";
import { OpportunitiesNamespace } from "./opportunities/index.js";
import type { Positions } from "./positions/index.js";
import { PositionsNamespace } from "./positions/index.js";
import type {
  GearboxSDKOptions,
  Mode,
  OffchainByMode,
  OnchainByMode,
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
 * const { result, meta } = await sdk.opportunities.list({ kind: "strategy" });
 * ```
 *
 * Every read answers with `{ result, meta }`: `meta` says which chains and
 * which backend answered, because a partial answer is the normal case for a
 * multi-chain read.
 *
 * @typeParam M - Mode the instance was built in.
 **/
export class GearboxSDK<const M extends Mode = Mode> {
  /**
   * Sources this instance reads from.
   **/
  public readonly mode: M;
  /**
   * Chains this instance covers. Authoritative even when an injected on-chain
   * SDK covers a different set.
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
    const { mode, networks, onchain, offchain, attach, logger } = options;

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

    if (needsOnchain && onchain) {
      if (onchain instanceof MultichainSDK) {
        // an injected instance belongs to its owner: it is used as it is, and
        // never attached or synced from here
        this.#onchain = onchain;
      } else {
        this.#onchain = new MultichainSDK({ logger, ...onchain });
        this.#ownsOnchain = true;
      }
    }
    if (needsOffchain && offchain) {
      this.#offchain =
        offchain instanceof GearboxAPI
          ? offchain
          : new GearboxAPI({ logger, ...offchain });
    }

    // an injected on-chain SDK is ready to read from; one built here is not
    // until `attach` resolves
    this.#attached = !this.#ownsOnchain;

    this.opportunities = new OpportunitiesNamespace(
      this.#onchain,
      this.#offchain,
      logger,
    ) as Opportunities<M>;
    this.positions = new PositionsNamespace(
      this.#onchain,
      this.#offchain,
      logger,
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
