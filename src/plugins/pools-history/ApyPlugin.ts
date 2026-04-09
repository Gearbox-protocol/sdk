import type { Address } from "viem";

import { marketCompressorAbi } from "../../abi/compressors/marketCompressor.js";
import type { IGearboxSDKPlugin, ILogger } from "../../sdk/index.js";
import {
  AddressMap,
  AP_MARKET_COMPRESSOR,
  BasePlugin,
  BLOCKS_PER_WEEK_BY_NETWORK,
  VERSION_RANGE_310,
} from "../../sdk/index.js";
import { ApyOutputCache } from "./apy-cache.js";
import { parseGearStats, parseNetworkApy } from "./apy-parser.js";
import { APY_STATE_CACHE_URL, DEFAULT_APY_INTERVAL_MS } from "./constants.js";
import type {
  ApySnapshotState,
  Pool7DAgoState,
  Pools7DAgoStateHuman,
} from "./types.js";

export interface ApyPluginState {
  pools7DAgo: Record<Address, Pool7DAgoState>;
  apySnapshot: ApySnapshotState;
}

export interface ApyPluginConstructorOptions {
  apyUrl?: string;
  /** TTL for the shared HTTP cache in milliseconds (default: same as timer interval) */
  cacheTtlMs?: number;
  timer?: PluginTimerOptions;
}

export interface ApyPluginLoadOptions {
  /**
   * When `false` and the plugin is already loaded, skips the multicall that loads
   * pool diesel rates at the ~7d-ago block; only the APY snapshot is refreshed.
   * Ignored on the first load (both datasets are always fetched initially).
   */
  loadPools7DAgo?: boolean;
}

export interface PluginTimerOptions {
  /** Polling interval in milliseconds (default: 10 minutes) */
  intervalMs?: number;
  /** Callback fired after each successful refresh */
  onChange?: () => void;
  /**
   * When `true`, each tick also refreshes 7d-ago pool state on-chain.
   */
  refreshPools7DAgoOnTick?: boolean;
}

const MAP_LABEL = "pools7DAgo";

export class ApyPlugin
  extends BasePlugin<ApyPluginState>
  implements IGearboxSDKPlugin<ApyPluginState>
{
  #timerInterval?: ReturnType<typeof setInterval>;
  #apyUrl: string;
  #cacheTtlMs: number;

  #pools7DAgo?: AddressMap<Pool7DAgoState>;
  #apySnapshot?: ApySnapshotState;

  /**
   * Default timer options
   * @see PluginTimerOptions
   */
  readonly #defaultTimerOptions: PluginTimerOptions;

  /**
   * When `true`, the timer is started eagerly during the `attach` phase
   * rather than waiting for an explicit `load` call.
   **/
  public readonly startTimerOnAttach: boolean;

  constructor(
    loadOnAttach = false,
    startTimerOnAttach = false,
    options?: ApyPluginConstructorOptions,
  ) {
    super(loadOnAttach);
    this.startTimerOnAttach = startTimerOnAttach;
    this.#apyUrl = options?.apyUrl ?? APY_STATE_CACHE_URL;
    this.#cacheTtlMs = options?.cacheTtlMs ?? DEFAULT_APY_INTERVAL_MS;

    this.#defaultTimerOptions = options?.timer ?? {
      refreshPools7DAgoOnTick: false,
      intervalMs: DEFAULT_APY_INTERVAL_MS,
      onChange: () => {},
    };
  }

  public async attach(): Promise<void> {
    await super.attach();
    if (this.startTimerOnAttach) {
      this.startTimer();
    }
  }

  // ---------------------------------------------------------------------------
  // Load — single entry point for all data (on-chain + state-cache)
  // ---------------------------------------------------------------------------

  public async load(
    force?: boolean,
    loadOptions?: ApyPluginLoadOptions,
  ): Promise<ApyPluginState> {
    if (!force && this.loaded) {
      return this.state;
    }

    const targetBlock =
      this.sdk.currentBlock - BLOCKS_PER_WEEK_BY_NETWORK[this.sdk.networkType];
    const [marketCompressorAddress] = this.sdk.addressProvider.mustGetLatest(
      AP_MARKET_COMPRESSOR,
      VERSION_RANGE_310,
    );

    this.#logger?.debug(
      `loading pools 7d ago with market compressor ${marketCompressorAddress}`,
    );

    const markets = this.sdk.marketRegister.markets;
    const shouldLoadPools7DAgo =
      !this.#pools7DAgo || !!loadOptions?.loadPools7DAgo;

    const [multicallResp, apySnapshot] = await Promise.all([
      shouldLoadPools7DAgo
        ? this.client.multicall({
            allowFailure: true,
            contracts: markets.map(
              m =>
                ({
                  address: marketCompressorAddress,
                  abi: marketCompressorAbi,
                  functionName: "getPoolState",
                  args: [m.pool.pool.address],
                }) as const,
            ),
            blockNumber: targetBlock > 0n ? targetBlock : undefined,
            batchSize: 0,
          })
        : null,
      this.#fetchApy(),
    ]);

    if (multicallResp !== null) {
      this.#pools7DAgo = new AddressMap<Pool7DAgoState>(undefined, MAP_LABEL);
      multicallResp.forEach((r, index) => {
        const m = markets[index];
        const cfg = m.configurator.address;
        const pool = m.pool.pool.address;

        if (r.status === "success") {
          this.#pools7DAgo?.upsert(m.pool.pool.address, {
            dieselRate: r.result.dieselRate,
            pool,
          });
        } else {
          this.#logger?.error(
            `failed to load pools 7d ago for market configurator ${this.labelAddress(cfg)} and pool ${this.labelAddress(pool)}: ${r.error}`,
          );
        }
      });
    }

    if (apySnapshot) {
      this.#apySnapshot = apySnapshot;
    }

    return this.state;
  }

  public get loaded(): boolean {
    return !!this.#pools7DAgo && !!this.#apySnapshot;
  }

  // ---------------------------------------------------------------------------
  // Accessors
  // ---------------------------------------------------------------------------

  /**
   * @throws if plugin is not loaded
   */
  public get pools7DAgo(): AddressMap<Pool7DAgoState> {
    if (!this.#pools7DAgo) {
      throw new Error("apy plugin not loaded");
    }
    return this.#pools7DAgo;
  }

  /**
   * @throws if plugin is not loaded
   */
  public get apySnapshot(): ApySnapshotState {
    if (!this.#apySnapshot) {
      throw new Error("apy plugin not loaded");
    }
    return this.#apySnapshot;
  }

  // ---------------------------------------------------------------------------
  // Periodic full refresh
  // ---------------------------------------------------------------------------

  /**
   * Starts a periodic timer that performs a full plugin state refresh.
   * Only one timer can be active; calling again is a no-op.
   * @returns Cleanup function that stops the timer.
   */
  public startTimer(opts?: PluginTimerOptions): () => void {
    if (this.#timerInterval) {
      this.#logger?.debug("plugin timer already running");
      return () => this.stopTimer();
    }

    const intervalMs = opts?.intervalMs ?? this.#defaultTimerOptions.intervalMs;
    this.#logger?.debug(`starting plugin timer (interval: ${intervalMs}ms)`);

    this.#timerInterval = setInterval(async () => {
      try {
        await this.load(true, {
          loadPools7DAgo:
            opts?.refreshPools7DAgoOnTick ??
            this.#defaultTimerOptions.refreshPools7DAgoOnTick,
        });
        opts?.onChange?.() ?? this.#defaultTimerOptions.onChange?.();
      } catch (e) {
        this.#logger?.error(e, "periodic refresh failed");
      }
    }, intervalMs);

    return () => this.stopTimer();
  }

  public stopTimer(): void {
    if (this.#timerInterval) {
      clearInterval(this.#timerInterval);
      this.#timerInterval = undefined;
      this.#logger?.debug("plugin timer stopped");
    }
  }

  // ---------------------------------------------------------------------------
  // Plugin lifecycle
  // ---------------------------------------------------------------------------

  public override async syncState(): Promise<void> {
    await this.load(true);
  }

  public stateHuman(_?: boolean): Pools7DAgoStateHuman[] {
    return this.pools7DAgo.values().flatMap(p => ({
      address: p.pool,
      version: this.version,
      dieselRate: p.dieselRate,
    }));
  }

  public get state(): ApyPluginState {
    return {
      pools7DAgo: this.pools7DAgo.asRecord(),
      apySnapshot: this.apySnapshot,
    };
  }

  public hydrate(state: ApyPluginState): void {
    this.#pools7DAgo = new AddressMap(
      Object.entries(state.pools7DAgo),
      MAP_LABEL,
    );
    this.#apySnapshot = state.apySnapshot;
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  async #fetchApy(): Promise<ApySnapshotState | undefined> {
    try {
      const cache = ApyOutputCache.get(
        this.#apyUrl,
        this.#cacheTtlMs,
        this.#logger,
      );
      const output = await cache.fetch();
      if (!output) return undefined;

      const chainData = output.chains[this.sdk.chainId];
      if (!chainData) {
        this.#logger?.debug(
          `apy state-cache: no data for chainId ${this.sdk.chainId}`,
        );
        return undefined;
      }

      const apy = parseNetworkApy(chainData.tokens, chainData.pools);
      if (!apy) return undefined;

      return {
        apy,
        gearStats: parseGearStats(output),
        timestamp: output.timestamp,
      };
    } catch (e) {
      this.#logger?.error(e, "failed to fetch apy state-cache");
      return undefined;
    }
  }

  get #logger(): ILogger | undefined {
    return this.logger;
  }
}
