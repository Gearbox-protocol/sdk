import type { Address } from "viem";

import type {
  IGearboxSDKPlugin,
  IPluginState,
  MarketSuite,
} from "../sdk/index.js";
import { AddressMap, SDKConstruct } from "../sdk/index.js";
import type { DegenDistributorsStateHuman } from "./types.js";

export interface DegenDistributorsPluginState extends IPluginState {
  distributors: Record<Address, Address>;
}

const MAP_LABEL = "degenDistributors";

export class DegenDistributorsPlugin
  extends SDKConstruct
  implements IGearboxSDKPlugin<DegenDistributorsPluginState>
{
  #distributors?: AddressMap<Address>;

  public readonly version = 1;

  public async attach(): Promise<void> {
    await this.loadDegenDistributors();
  }

  public async loadDegenDistributors(): Promise<void> {
    // Make list of market configurators with unique addresses
    const configurators = Object.values(
      this.sdk.marketRegister.markets.reduce<
        Record<Address, MarketSuite["configurator"]>
      >((acc, market) => {
        const cfgLC = market.configurator.address.toLowerCase() as Address;
        acc[cfgLC] = market.configurator;
        return acc;
      }, {}),
    );

    this.sdk.logger?.debug(
      `loading degen distributors for ${this.sdk.provider.networkType}`,
    );

    const distributors = await Promise.allSettled(
      configurators.map(cfg => cfg.getPeripheryContract("DEGEN_DISTRIBUTOR")),
    );

    const distributorByConfigurator = configurators.reduce<
      Record<Address, PromiseSettledResult<Address>>
    >((acc, cfg, index) => {
      const cfgLC = cfg.address.toLowerCase() as Address;
      acc[cfgLC] = distributors[index];
      return acc;
    }, {});

    this.sdk.marketRegister.markets.forEach(m => {
      const pool = m.pool.pool.address;
      const cfg = m.configurator.address;
      const cfgLC = cfg.toLowerCase() as Address;
      const r = distributorByConfigurator?.[cfgLC];

      if (!this.#distributors) {
        this.#distributors = new AddressMap<Address>(undefined, MAP_LABEL);
      }

      if (r.status === "fulfilled") {
        this.#distributors.upsert(pool, r.value);
      } else {
        this.sdk.logger?.error(
          `failed to load degen distributor for market configurator ${this.labelAddress(cfg)} and pool ${this.labelAddress(pool)}: ${r.reason}`,
        );
      }
    });
  }

  /**
   * Returns a map of pool addresses to degen distributor addresses
   * @throws if degen distributor plugin is not attached
   */
  public get distributors(): AddressMap<Address> {
    if (!this.#distributors) {
      throw new Error("degen distributor plugin not attached");
    }
    return this.#distributors;
  }

  public stateHuman(_?: boolean): DegenDistributorsStateHuman[] {
    return this.distributors.entries().flatMap(([pool, distributor]) => ({
      address: distributor,
      version: this.version,
      pool,
    }));
  }

  public get state(): DegenDistributorsPluginState {
    return {
      version: this.version,
      distributors: this.distributors.asRecord(),
    };
  }

  public hydrate(state: DegenDistributorsPluginState): void {
    this.#distributors = new AddressMap(
      Object.entries(state.distributors),
      MAP_LABEL,
    );
  }
}
