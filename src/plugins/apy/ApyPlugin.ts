import type { Address } from "viem";

import { marketCompressorAbi } from "../../abi/compressors/marketCompressor.js";
import { AxiosCache } from "../../common-utils/axios-cache/index.js";
import {
  getAvailableAndDisabledStrategies,
  getReleasedStrategiesListCore,
  getStrategyCreditManagersListCore,
  getStrategyInfoCore,
} from "../../common-utils/utils/strategies/index.js";
import type {
  Strategy,
  StrategyCreditManagerView,
} from "../../common-utils/utils/strategies/types.js";
import type { Output } from "../../rewards/apy/index.js";
import { PoolPointsAPI } from "../../rewards/rewards/extra-apy.js";
import type { ILogger, IOnchainSDKPlugin } from "../../sdk/index.js";
import {
  AddressMap,
  AP_MARKET_COMPRESSOR,
  BasePlugin,
  BLOCKS_PER_WEEK_BY_NETWORK,
  PERCENTAGE_DECIMALS,
  VERSION_RANGE_310,
} from "../../sdk/index.js";
import type { Asset } from "../../sdk/router/types.js";
import { rayToNumber } from "../../sdk/utils/formatter.js";
import { hexEq } from "../../sdk/utils/hex.js";
import { parseGearStats, parseNetworkApy } from "./apy-parser.js";
import { APY_STATE_CACHE_URL, DEFAULT_APY_INTERVAL_MS } from "./constants.js";
import type { GetPoolsAPYResult } from "./pool-apy-types.js";
import {
  calculatePoolFullAPY,
  calculatePoolFullAPY7DAgo,
  calculatePoolPoints,
  calculateSupplyApy7d,
  getPoolExtraAPY,
} from "./pool-apy-utils.js";
import { OnchainSdkStrategyDataSource } from "./strategy-data-source.js";
import type {
  ApySnapshotState,
  GetStrategyInfoSnapshotArgs,
  Pool7DAgoState,
  Pools7DAgoStateHuman,
  StrategyInfoSnapshot,
} from "./types.js";

export interface ApyPluginState {
  pools7DAgo: Record<Address, Pool7DAgoState>;
  apySnapshot: ApySnapshotState;
}

export interface ApyPluginConstructorOptions {
  apyUrl?: string;
  /** TTL for the shared HTTP cache in milliseconds (default: 10 minutes, see `DEFAULT_APY_INTERVAL_MS`) */
  cacheTtlMs?: number;
}

export interface ApyPluginLoadOptions {
  /**
   * When `false` and the plugin is already loaded, skips the multicall that loads
   * pool diesel rates at the ~7d-ago block; only the APY snapshot is refreshed.
   * Ignored on the first load (both datasets are always fetched initially).
   */
  loadPools7DAgo?: boolean;
}

const MAP_LABEL = "pools7DAgo";

export class ApyPlugin
  extends BasePlugin<ApyPluginState>
  implements IOnchainSDKPlugin<ApyPluginState>
{
  #apyUrl: string;
  #cacheTtlMs: number;

  #pools7DAgo?: AddressMap<Pool7DAgoState>;
  #apySnapshot?: ApySnapshotState;

  constructor(loadOnAttach = false, options?: ApyPluginConstructorOptions) {
    super(loadOnAttach);
    this.#apyUrl = options?.apyUrl ?? APY_STATE_CACHE_URL;
    this.#cacheTtlMs = options?.cacheTtlMs ?? DEFAULT_APY_INTERVAL_MS;
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
  // Aggregated APY / points
  // ---------------------------------------------------------------------------

  /**
   * Computes per-pool APY (current + 7d-ago) and points for all markets.
   *
   * @throws if plugin is not loaded
   */
  public getPoolsAPY(): GetPoolsAPYResult {
    if (!this.loaded) {
      throw new Error("apy plugin not loaded");
    }

    const markets = this.sdk.marketRegister.markets;
    const { apy } = this.apySnapshot;

    // TODO: totalTokenBalances is currently empty — relative points estimation
    // will return null for "relative" type rewards.
    // Fetching supply data from the backend (charts-server or equivalent)
    // is not required at this stage but must be implemented when relative
    // points accuracy becomes necessary.
    const totalTokenBalances: Record<Address, Asset> = {};

    const poolPointsBase =
      apy.poolRewardsList && Object.keys(apy.poolRewardsList).length > 0
        ? PoolPointsAPI.getPointsByPool({
            poolRewards: apy.poolRewardsList,
            totalTokenBalances,
            pools: markets,
            tokensList: this.sdk.tokensMeta,
          })
        : {};

    const data: GetPoolsAPYResult["data"] = {};
    const data7DAgo: GetPoolsAPYResult["data7DAgo"] = {};
    const points: GetPoolsAPYResult["points"] = {};

    for (const market of markets) {
      const pool = market.pool.pool;
      const poolAddr = pool.address.toLowerCase() as Address;
      const underlyingLc = pool.underlying.toLowerCase() as Address;

      const depositAPY =
        rayToNumber(pool.supplyRate) * Number(PERCENTAGE_DECIMALS);

      const underlyingAPY =
        apy.apyList?.[underlyingLc] ?? apy.apyList?.[pool.underlying] ?? 0;

      const lookupAddresses = this.#getExtraAPYLookupAddresses(poolAddr);
      const extraAPY = getPoolExtraAPY(lookupAddresses, apy.poolExtraAPYList);

      const currentExternalList = apy.poolExternalAPYList?.[poolAddr];

      const poolAPY = calculatePoolFullAPY({
        depositAPY,
        underlyingAPY,
        extraAPY,
        currentExternalList,
      });
      data[poolAddr] = poolAPY;

      const pool7DAgo = this.#pools7DAgo?.get(poolAddr);
      const supplyAPY7DAgo = pool7DAgo
        ? calculateSupplyApy7d(
            pool.dieselRate,
            pool.supplyRate,
            pool7DAgo.dieselRate,
          )
        : undefined;

      data7DAgo[poolAddr] = calculatePoolFullAPY7DAgo({
        supplyAPY7DAgo,
        depositAPY,
        poolAPY,
      });

      const poolTokenMeta = this.sdk.tokensMeta.get(pool.underlying);
      points[poolAddr] = calculatePoolPoints({
        poolTokenSymbol: poolTokenMeta?.symbol,
        points: poolPointsBase[poolAddr],
        tokensList: this.sdk.tokensMeta,
      });
    }

    return { data, data7DAgo, pointsBase: poolPointsBase, points };
  }

  /**
   * Computes a strategy-info snapshot from the current SDK and APY state.
   *
   * @throws if plugin is not loaded
   */
  public getStrategyInfoSnapshot({
    slippage,
    quotaReserve,
    curatorFilter,
    strategyPayloadsList,
    showHiddenStrategies,
  }: GetStrategyInfoSnapshotArgs): StrategyInfoSnapshot<StrategyCreditManagerView> {
    if (!this.loaded) {
      throw new Error("apy plugin not loaded");
    }

    const chainId = this.sdk.chainId;
    const network = this.sdk.networkType;
    const allowedChains = { [chainId]: network };
    const source = new OnchainSdkStrategyDataSource(this.sdk);

    const releasedStrategies = getReleasedStrategiesListCore({
      strategyPayloadsList,
      allowedChains,
      source,
      curatorFilter,
      showHiddenStrategies,
    });

    const cmsOfStrategiesByChain =
      getStrategyCreditManagersListCore<StrategyCreditManagerView>({
        strategies: releasedStrategies,
        source,
        curatorFilter,
      });

    const { available, disabled, availableList, disabledList } =
      getAvailableAndDisabledStrategies<StrategyCreditManagerView>(
        releasedStrategies,
        cmsOfStrategiesByChain,
        curatorFilter,
      );

    const apyListByNetwork = {
      [chainId]: this.apySnapshot.apy,
    };

    const strategiesInfo =
      releasedStrategies?.reduce<
        StrategyInfoSnapshot<StrategyCreditManagerView>["strategiesInfo"]
      >((acc, strategy) => {
        const info = getStrategyInfoCore<
          Strategy["id"],
          StrategyCreditManagerView
        >({
          strategy,
          creditManagers:
            cmsOfStrategiesByChain?.[strategy.chainId]?.[strategy.id],
          source,
          apyListByNetwork,
          quotaReserve,
          slippage,
        });

        if (info) {
          acc[strategy.chainId] ??= {};
          acc[strategy.chainId][strategy.id] = info;
        }

        return acc;
      }, {}) ?? {};

    return {
      availableStrategies: available,
      disabledStrategies: disabled,
      availableList,
      disabledList,
      cmsOfStrategiesByChain,
      strategiesInfo,
    };
  }

  // ---------------------------------------------------------------------------
  // Plugin lifecycle
  // ---------------------------------------------------------------------------

  public override async syncState(): Promise<void> {
    await this.load();
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
      const cache = AxiosCache.get<Output<string, string>>(
        this.#apyUrl,
        this.#cacheTtlMs,
        this.#logger,
        data => `timestamp: ${data.timestamp}`,
      );
      const output = await cache.fetch();

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

  /**
   * Collects addresses to look up in poolExtraAPYList for a given pool.
   * Includes pool address (= diesel token) + any staked diesel token
   * outputs discovered from zappers.
   */
  #getExtraAPYLookupAddresses(poolAddr: Address): Address[] {
    const addresses: Address[] = [poolAddr];
    try {
      const zappers = this.sdk.marketRegister.poolZappers(poolAddr);
      for (const z of zappers) {
        if (!hexEq(z.tokenOut.addr, poolAddr)) {
          addresses.push(z.tokenOut.addr);
        }
      }
    } catch {
      // zappers not loaded — fall back to pool address only
    }
    return addresses;
  }

  get #logger(): ILogger | undefined {
    return this.logger;
  }
}
