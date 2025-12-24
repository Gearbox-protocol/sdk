import type { Address } from "viem";

import type { IGearboxSDKPlugin, MarketSuite } from "../../sdk/index.js";
import { AddressMap, BasePlugin } from "../../sdk/index.js";
import { MarketConfiguratorContract } from "../../sdk/market/MarketConfiguratorContract.js";
import type { DegenDistributorsStateHuman } from "./types.js";

export interface DegenDistributorsPluginState {
  distributors: Record<Address, Address>;
}

const MAP_LABEL = "degenDistributors";

export class DegenDistributorsPlugin
  extends BasePlugin<DegenDistributorsPluginState>
  implements IGearboxSDKPlugin<DegenDistributorsPluginState>
{
  #distributors?: AddressMap<Address>;

  public async load(force?: boolean): Promise<DegenDistributorsPluginState> {
    if (!force && this.loaded) {
      return this.state;
    }

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
      `loading degen distributors for ${this.sdk.networkType}`,
    );

    const distributors =
      await MarketConfiguratorContract.getPeripheryContractBatch(
        Object.values(configurators),
        this.sdk.client,
        "DEGEN_DISTRIBUTOR",
      );

    const distributorByConfigurator = configurators.reduce<
      Record<
        Address,
        | {
            error?: undefined;
            result: readonly `0x${string}`[];
            status: "success";
          }
        | {
            error: Error;
            result?: undefined;
            status: "failure";
          }
      >
    >((acc, cfg, index) => {
      const cfgLC = cfg.address.toLowerCase() as Address;
      const distributor = distributors[index];

      acc[cfgLC] = distributor;
      return acc;
    }, {});

    this.#distributors = new AddressMap<Address>(undefined, MAP_LABEL);
    this.sdk.marketRegister.markets.forEach(m => {
      const pool = m.pool.pool.address;
      const cfg = m.configurator.address;
      const cfgLC = cfg.toLowerCase() as Address;
      const r = distributorByConfigurator?.[cfgLC];

      if (r.status === "success" && r.result.length > 0) {
        this.#distributors?.upsert(pool, r.result[0]);
      } else {
        this.sdk.logger?.warn(
          `failed to load degen distributor for market configurator ${this.labelAddress(
            cfg,
          )} and pool ${this.labelAddress(pool)}: ${r.error}`,
        );
      }
    });
    return this.state;
  }

  public get loaded(): boolean {
    return !!this.#distributors;
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
