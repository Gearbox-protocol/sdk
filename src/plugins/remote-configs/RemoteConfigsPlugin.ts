import { type Address, isAddress } from "viem";

import type { PoolConfigPayload } from "../../common-utils/static/pool-config.js";
import type { StrategyConfigPayload } from "../../common-utils/static/strategy.js";
import type {
  ExtraCollateralConfig,
  NotValidatedStrategy,
} from "../../common-utils/utils/strategies/types/strategy.js";
import {
  BasePlugin,
  type IOnchainSDKPlugin,
  TypedObjectUtils,
} from "../../sdk/index.js";
import { RemoteConfigSource } from "./RemoteConfigSource.js";
import type {
  ConfigSource,
  RemoteConfigsPluginOptions,
  RemoteConfigsPluginState,
} from "./types.js";

export class RemoteConfigsPlugin
  extends BasePlugin<RemoteConfigsPluginState>
  implements IOnchainSDKPlugin<RemoteConfigsPluginState>
{
  #sources: ConfigSource[];

  #pools?: PoolConfigPayload[];
  #strategies?: NotValidatedStrategy[];

  constructor(loadOnAttach = false, options?: RemoteConfigsPluginOptions) {
    super(loadOnAttach);
    this.#sources = options?.sources ?? [new RemoteConfigSource()];
  }

  public get loaded(): boolean {
    return !!this.#pools && !!this.#strategies;
  }

  public async load(force?: boolean): Promise<RemoteConfigsPluginState> {
    if (!force && this.loaded) {
      return this.state;
    }

    const [pools, strategies] = await Promise.all([
      this.#loadPools(),
      this.#loadStrategies(),
    ]);

    this.#pools = pools;
    this.#strategies = strategies;

    return this.state;
  }

  public get state(): RemoteConfigsPluginState {
    return {
      pools: this.pools,
      strategies: this.strategies,
    };
  }

  public hydrate(state: RemoteConfigsPluginState): void {
    this.#pools = state.pools;
    this.#strategies = state.strategies;
  }

  public stateHuman(_?: boolean): RemoteConfigsPluginState {
    return this.state;
  }

  // ---------------------------------------------------------------------------
  // Accessors
  // ---------------------------------------------------------------------------

  /**
   * All loaded pool configs.
   * @throws if plugin is not loaded
   */
  public get pools(): PoolConfigPayload[] {
    if (!this.#pools) {
      throw new Error("remote-configs plugin not loaded");
    }
    return this.#pools;
  }

  /**
   * Pool configs filtered for the current SDK network.
   * @throws if plugin is not loaded
   */
  public get poolsForCurrentNetwork(): PoolConfigPayload[] {
    return this.pools.filter(
      p =>
        p.chainId === this.sdk.chainId &&
        p.network.toLowerCase() === this.sdk.networkType.toLowerCase(),
    );
  }

  /**
   * Returns a pool config by address (case-insensitive).
   * @throws if plugin is not loaded
   */
  public getPoolConfig(address: Address): PoolConfigPayload | undefined {
    const lc = address.toLowerCase();
    return this.pools.find(p => p.address === lc);
  }

  /**
   * All loaded strategy configs.
   * @throws if plugin is not loaded
   */
  public get strategies(): NotValidatedStrategy[] {
    if (!this.#strategies) {
      throw new Error("remote-configs plugin not loaded");
    }
    return this.#strategies;
  }

  /**
   * Strategy configs filtered for the current SDK network.
   * @throws if plugin is not loaded
   */
  public get strategiesForCurrentNetwork(): NotValidatedStrategy[] {
    return this.strategies.filter(
      s =>
        s.chainId === this.sdk.chainId &&
        s.network.toLowerCase() === this.sdk.networkType.toLowerCase(),
    );
  }

  /**
   * Returns a strategy config by its id.
   * @throws if plugin is not loaded
   */
  public getStrategyConfig(id: string): NotValidatedStrategy | undefined {
    return this.strategies.find(s => s.id === id);
  }

  // ---------------------------------------------------------------------------
  // Internal
  // ---------------------------------------------------------------------------

  async #loadPools(): Promise<PoolConfigPayload[]> {
    for (const source of this.#sources) {
      try {
        const data = await source.getPools();
        return this.#mapPoolPayload(data);
      } catch (e) {
        this.logger?.warn(e, `${source.constructor.name} failed to load pools`);
      }
    }
    throw new Error("all config sources failed to load pools");
  }

  async #loadStrategies(): Promise<NotValidatedStrategy[]> {
    for (const source of this.#sources) {
      try {
        const data = await source.getStrategies();
        return this.#mapStrategyPayload(data);
      } catch (e) {
        this.logger?.warn(
          e,
          `${source.constructor.name} failed to load strategies`,
        );
      }
    }
    throw new Error("all config sources failed to load strategies");
  }

  #mapPoolPayload(payload: Array<PoolConfigPayload>): Array<PoolConfigPayload> {
    return payload.reduce<Array<PoolConfigPayload>>((acc, p) => {
      const addressLc = p.address.toLowerCase();

      if (isAddress(addressLc)) {
        acc.push({
          ...p,
          address: addressLc,
        });
      }

      return acc;
    }, []);
  }

  #mapStrategyPayload(
    payload: Array<StrategyConfigPayload>,
  ): Array<NotValidatedStrategy> {
    return payload.reduce<Array<NotValidatedStrategy>>((acc, p) => {
      const tokenOutAddressLc = p.tokenOutAddress.toLowerCase();

      const creditManagers = p.creditManagers
        .filter(cm => isAddress(cm))
        .map(cm => cm.toLowerCase() as Address);

      const zeroSlippage = p.zeroSlippage
        ? TypedObjectUtils.entries(p.zeroSlippage).reduce<
            NonNullable<NotValidatedStrategy["zeroSlippage"]>
          >((zsAcc, [address, value]) => {
            const addressLc = address.toLowerCase() as Address;

            if (isAddress(addressLc)) zsAcc[addressLc] = value;

            return zsAcc;
          }, {})
        : undefined;

      const additionalRewardQuotas = p.additionalRewardQuotas
        ? TypedObjectUtils.entries(p.additionalRewardQuotas).reduce<
            NonNullable<NotValidatedStrategy["additionalRewardQuotas"]>
          >((rqAcc, [address, value]) => {
            const addressLc = address.toLowerCase() as Address;

            if (isAddress(addressLc)) {
              const rewards = value
                ?.filter(r => isAddress(r))
                .map(r => r.toLowerCase() as Address);
              rqAcc[addressLc] = rewards;
            }

            return rqAcc;
          }, {})
        : undefined;

      const additionalCollaterals = p.additionalCollaterals?.reduce<
        Record<Address, Array<ExtraCollateralConfig>>
      >((colAcc, cfg) => {
        const token = typeof cfg === "string" ? cfg : cfg.token;
        const tokenLc = token.toLowerCase() as Address;

        const valid = isAddress(tokenLc);
        if (valid && !colAcc[tokenLc]) colAcc[tokenLc] = [];

        const nextCfg: ExtraCollateralConfig =
          typeof cfg === "string"
            ? tokenLc
            : {
                token: tokenLc,
                cm: cfg.cm.toLowerCase() as Address,
              };
        if (valid) colAcc[tokenLc].push(nextCfg);

        return colAcc;
      }, {});

      if (isAddress(tokenOutAddressLc)) {
        const { additionalCollaterals: _, ...rest } = p;

        acc.push({
          ...rest,
          tokenOutAddress: tokenOutAddressLc,
          creditManagers,
          ...(zeroSlippage ? { zeroSlippage } : {}),
          ...(additionalRewardQuotas ? { additionalRewardQuotas } : {}),
          ...(additionalCollaterals ? { additionalCollaterals } : {}),
        });
      }

      return acc;
    }, []);
  }
}
