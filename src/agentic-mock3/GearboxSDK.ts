import {
  type ILogger,
  type MultichainAttachOptions,
  MultichainSDK,
  type MultichainSDKOptions,
  type NetworkType,
} from "../sdk/index.js";
import {
  type IfOffchain,
  type Mode,
  NotAttachedError,
  type SDKContext,
} from "./core/index.js";
import type { IfOnchain } from "./core/mode.js";
import { CuratorsNamespace } from "./curator/index.js";
import type { MarketsNamespaceType } from "./market/index.js";
import { MarketsNamespace } from "./market/index.js";
import { OffchainSDK, type OffchainSDKConfig } from "./offchain/index.js";
import { OpportunitiesNamespace } from "./opportunity/index.js";
import { TokensNamespace } from "./tokens/TokensNamespace.js";

export interface GearboxSDKBase {
  readonly modes: readonly Mode[];
  readonly networks: readonly NetworkType[];
}

export type GearboxNamespaces<M extends Mode> = {
  readonly markets: MarketsNamespaceType<M>;
} & IfOffchain<
  M,
  {
    readonly opportunities: OpportunitiesNamespace<M>;
    readonly curators: CuratorsNamespace;
  }
>;

export type GearboxSDK<M extends Mode> = GearboxSDKBase & GearboxNamespaces<M>;

export interface GearboxSDKConfig<M extends Mode> {
  modes: M[];
  networks: NetworkType[];
  // biome-ignore lint/complexity/noBannedTypes: TODO generic plugin map
  onchain?: Omit<MultichainSDKOptions<{}>, "logger">;
  offchain?: OffchainSDKConfig;
  logger?: ILogger;
}

export type GearboxSDKAttachOptions<M extends Mode> = IfOnchain<
  M,
  { onchain?: MultichainAttachOptions }
>;

class GearboxSDKImpl implements SDKContext<Mode> {
  public readonly modes: Mode[];
  public readonly networks: NetworkType[];

  readonly #multichain: MultichainSDK | null = null;
  readonly #offchain: OffchainSDK | null = null;

  #markets?: MarketsNamespace<Mode>;
  #opportunities?: OpportunitiesNamespace<Mode>;
  #curators?: CuratorsNamespace;
  #tokens?: TokensNamespace<Mode>;

  constructor(config: GearboxSDKConfig<Mode>) {
    this.modes = config.modes;
    // TODO: check networks parity with onchain and offchain
    this.networks = config.networks;

    if (config.modes.includes("onchain") && config.onchain) {
      this.#multichain = new MultichainSDK({
        ...config.onchain,
        logger: config.logger,
      });
    }

    if (config.modes.includes("offchain")) {
      this.#offchain = new OffchainSDK({
        networks: config.networks,
        logger: config.logger,
      });
    }
  }

  public async attach(options?: GearboxSDKAttachOptions<Mode>): Promise<void> {
    await Promise.all([
      this.#multichain?.attach(options?.onchain),
      this.#offchain?.attach(),
    ]);

    // Order matters: downstream namespaces call `sdk.tokens.getOrCreate(...)`
    // from their constructors, so tokens must be populated first.
    this.#tokens = new TokensNamespace<Mode>(this);
    this.#markets = new MarketsNamespace<Mode>(this);
    this.#opportunities = new OpportunitiesNamespace<Mode>(this);
    this.#curators = new CuratorsNamespace(this);
  }

  // -- SDKContext<Mode> surface ----------------------------------------------

  public get multichain(): MultichainSDK | null {
    return this.#multichain;
  }

  public get offchain(): OffchainSDK | null {
    return this.#offchain;
  }

  public get markets(): MarketsNamespace<Mode> {
    if (!this.#markets) {
      throw new NotAttachedError();
    }
    return this.#markets;
  }

  public get opportunities(): OpportunitiesNamespace<Mode> {
    if (!this.#opportunities) {
      throw new NotAttachedError();
    }
    return this.#opportunities;
  }

  public get curators(): CuratorsNamespace {
    if (!this.#curators) {
      throw new NotAttachedError();
    }
    return this.#curators;
  }

  public get tokens(): TokensNamespace<Mode> {
    if (!this.#tokens) {
      throw new NotAttachedError();
    }
    return this.#tokens;
  }
}

// ============================================================================
// Factory
// ============================================================================

export function createGearboxSDK<const M extends Mode>(
  config: GearboxSDKConfig<M>,
): GearboxSDK<M> & { attach(): Promise<void> } {
  const impl = new GearboxSDKImpl(config as GearboxSDKConfig<Mode>);
  return impl as unknown as GearboxSDK<M> & { attach(): Promise<void> };
}
