import type { Address, Chain, PublicClient, Transport } from "viem";
import {
  type GearboxState,
  getChain,
  getNetworkType,
  OnchainSDK,
} from "../../../onchain/index.js";
import type { GovernorContract } from "../../bindings/governance/governor.js";
import { MarketConfiguratorContract } from "../../bindings/market-configurator.js";
import type { GipBuilderContext } from "../actions/builderContext.js";
import type { ExecutorOptions } from "../executor/actionEnv.js";
import { ResolveCache } from "../executor/ResolveCache.js";
import { GipRegistry } from "../GipRegistry.js";
import { getGovernorContract } from "../transactions/getTimelockTransactions.js";
import { createPinnedReadClient } from "./createPinnedReadClient.js";
import type { GipAnvilForkOptions } from "./forkConnection.js";
import { SharedPromise } from "./SharedPromise.js";
import { deepCopy } from "./snapshot.js";
import { TokenDecimalsCache } from "./TokenDecimalsCache.js";
import type { GipSourceSnapshot, IncompleteCheck } from "./types.js";

export interface GipSdkRuntimeInit {
  client: PublicClient<Transport, Chain>;
  source: GipSourceSnapshot;
  fork?: GipAnvilForkOptions;
  /** Already attached or hydrated SDK to reuse instead of attaching a new one. **/
  sdk?: OnchainSDK;
  /** Serialized SDK state to hydrate from instead of reading the chain. **/
  sdkState?: GearboxState;
  tokenDecimals?: Record<string, number>;
  gasLimit?: bigint;
  /** Defaults to the built-in definitions. **/
  registry?: GipRegistry;
}

/**
 * Everything an SDK instance shares between its builders: the pinned read
 * client, the configurator binding, lazily resolved on-chain dependencies and
 * the caches that make repeated compilations stable.
 **/
export class GipSdkRuntime {
  readonly fork: GipAnvilForkOptions | undefined;
  readonly source: GipSourceSnapshot;
  /** Reads default to {@link GipSourceSnapshot.blockNumber}. **/
  readonly readClient: PublicClient<Transport, Chain>;
  readonly marketConfigurator: MarketConfiguratorContract;
  readonly tokens: TokenDecimalsCache;
  readonly ctx: GipBuilderContext;
  /** Provenance caveats discovered while wiring the runtime up. **/
  readonly notes: IncompleteCheck[] = [];
  /**
   * Action `resolve` results shared by every compilation of this SDK: they
   * depend on the source block only, so a replay never reads them again.
   **/
  readonly resolveCache = new ResolveCache();
  /** The built-in definitions plus the plugins the SDK was created with. **/
  readonly registry: GipRegistry;

  readonly #init: GipSdkRuntimeInit;
  /** The SDK once it is usable: the supplied one, or the attached one. **/
  #resolvedSdk?: OnchainSDK;
  readonly #onchainSdk = new SharedPromise<OnchainSDK>();
  readonly #addressProviderSdk = new SharedPromise<OnchainSDK>();
  readonly #governor = new SharedPromise<GovernorContract>();
  readonly #timelockAdmin = new SharedPromise<Address>();

  /** `CuratorSession` has validated `init`: at most one of `sdk` and `sdkState`. **/
  constructor(init: GipSdkRuntimeInit) {
    this.#init = init;
    this.registry = init.registry ?? GipRegistry.builtin;
    this.#resolvedSdk = init.sdk;
    this.fork = init.fork;
    this.source = init.source;
    this.readClient = createPinnedReadClient(
      init.client,
      init.source.blockNumber,
      getChain(init.source.chainId),
    );
    this.marketConfigurator = new MarketConfiguratorContract(
      init.source.marketConfigurator,
      this.readClient,
    );
    this.tokens = new TokenDecimalsCache({
      client: this.readClient,
      overrides: init.tokenDecimals,
      // Only an already-resolved SDK is consulted: asking for decimals must
      // never trigger an attach.
      known: () =>
        this.#resolvedSdk?.attached ? this.#resolvedSdk.tokensMeta : undefined,
    });
    this.ctx = {
      client: this.readClient,
      marketConfigurator: this.marketConfigurator,
      tokens: { decimals: token => this.tokens.decimals(token) },
      ...(init.gasLimit !== undefined ? { gasLimit: init.gasLimit } : {}),
    };

    if (init.sdk) {
      this.#noteSuppliedSnapshot({
        label: "OnchainSDK",
        stateLabel: "OnchainSDK state",
        check: "sdk-snapshot",
        // An SDK whose client names no chain is taken at its word.
        chainId: init.sdk.client.chain?.id ?? init.source.chainId,
        currentBlock: init.sdk.currentBlock,
        hashCaveat:
          "the supplied OnchainSDK exposes its block number but not the canonical block hash, so its snapshot hash cannot be verified against the GIP source",
      });
    }
    if (init.sdkState) {
      this.#noteSuppliedSnapshot({
        label: "GearboxState",
        stateLabel: "GearboxState",
        check: "sdk-state-snapshot",
        chainId: init.sdkState.chainId,
        currentBlock: init.sdkState.currentBlock,
        hashCaveat:
          "the supplied GearboxState has no canonical block hash, so its snapshot hash cannot be verified against the GIP source",
      });
    }
  }

  /**
   * A caller-supplied snapshot is used as-is, so what cannot be verified about
   * it is reported: a wrong chain is fatal, a different block and the unknown
   * block hash become provenance notes.
   **/
  #noteSuppliedSnapshot(snapshot: {
    label: string;
    stateLabel: string;
    check: string;
    chainId: number;
    currentBlock: bigint;
    hashCaveat: string;
  }): void {
    const { source } = this;
    const { label, check, chainId, currentBlock } = snapshot;

    if (chainId !== source.chainId) {
      throw new Error(
        `Supplied ${label} is on chain ${chainId}, but this GIP SDK is scoped to chain ${source.chainId}`,
      );
    }
    if (currentBlock !== source.blockNumber) {
      this.notes.push({
        check: `${check}-block`,
        reason: `supplied ${snapshot.stateLabel} is at block ${currentBlock}, the source block is ${source.blockNumber}`,
      });
    }
    this.notes.push({
      check: `${check}-block-hash`,
      reason: snapshot.hashCaveat,
    });
  }

  /** `eta` checked, or the source block time when it is omitted. **/
  eta(eta?: number): number {
    const value = eta ?? this.source.blockTimestamp;
    if (!Number.isSafeInteger(value) || value < 0)
      throw new Error("eta must be a nonnegative safe integer in Unix seconds");
    return value;
  }

  /**
   * Options of an executor compiling for `eta`: time-dependent transitions run
   * at `eta`, or at the source block if that is later.
   **/
  executorOptions(eta: number): ExecutorOptions {
    return {
      timestamp: Math.max(eta, this.source.blockTimestamp),
      resolveCache: this.resolveCache,
      registry: this.registry,
    };
  }

  /**
   * SDK that can read market state for this configurator.
   *
   * A caller-supplied state or SDK is used as-is — never replaced by an
   * on-chain read — but it is still attached lazily when neither was given.
   **/
  onchainSdk(): Promise<OnchainSDK> {
    if (this.#init.sdk) return Promise.resolve(this.#init.sdk);
    return this.#onchainSdk.run(async () => {
      const sdk = await this.#createSdk([this.source.marketConfigurator]);
      this.#resolvedSdk = sdk;
      return sdk;
    });
  }

  /**
   * Cheapest SDK that can resolve address-provider entries (the price feed
   * compressor needed when stamping feed dependencies). Reuses the full SDK
   * when one already exists.
   **/
  addressProviderSdk(): Promise<OnchainSDK> {
    if (this.#init.sdk) return Promise.resolve(this.#init.sdk);
    return (
      this.#onchainSdk.current ??
      this.#addressProviderSdk.run(() => this.#createSdk([]))
    );
  }

  async #createSdk(marketConfigurators: Address[]): Promise<OnchainSDK> {
    const sdk = new OnchainSDK(
      getNetworkType(this.source.chainId),
      // @dev the caller's client is reused directly: no transport URL is read
      // off it and no second RPC connection is created.
      { client: this.readClient as never },
      this.#init.gasLimit !== undefined
        ? { gasLimit: this.#init.gasLimit }
        : {},
    );
    if (this.#init.sdkState) {
      sdk.hydrate(deepCopy(this.#init.sdkState));
      return sdk;
    }
    await sdk.attach({
      marketConfigurators,
      blockNumber: this.source.blockNumber,
    });
    return sdk;
  }

  /** TimeLock that executes this configurator's governance transactions. **/
  timelockAdmin(): Promise<Address> {
    return this.#timelockAdmin.run(() =>
      this.marketConfigurator.contract.read.admin(),
    );
  }

  governor(): Promise<GovernorContract> {
    return this.#governor.run(() =>
      getGovernorContract({
        client: this.readClient,
        marketConfigurator: this.source.marketConfigurator,
      }),
    );
  }
}
