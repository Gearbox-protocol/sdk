import type { Address } from "viem";
import { marketCompressorAbi } from "../../abi/compressors/marketCompressor.js";
import type { IGearboxSDKPlugin } from "../../sdk/index.js";
import {
  AddressMap,
  AP_MARKET_COMPRESSOR,
  BasePlugin,
  BigIntMath,
  BLOCKS_PER_WEEK_BY_NETWORK,
  VERSION_RANGE_310,
} from "../../sdk/index.js";
import type { Pool7DAgoState, Pools7DAgoStateHuman } from "./types.js";

export interface Pools7DAgoPluginState {
  pools7DAgo: Record<Address, Pool7DAgoState>;
}

const MAP_LABEL = "pools7DAgo";

export class Pools7DAgoPlugin
  extends BasePlugin<Pools7DAgoPluginState>
  implements IGearboxSDKPlugin<Pools7DAgoPluginState>
{
  #pools7DAgo?: AddressMap<Pool7DAgoState>;

  public async load(force?: boolean): Promise<Pools7DAgoPluginState> {
    if (!force && this.loaded) {
      return this.state;
    }

    // TODO: Implement better logic to find block 7 days ago
    const targetBlock =
      this.sdk.currentBlock - BLOCKS_PER_WEEK_BY_NETWORK[this.sdk.networkType];
    const [marketCompressorAddress] = this.sdk.addressProvider.mustGetLatest(
      AP_MARKET_COMPRESSOR,
      VERSION_RANGE_310,
    );

    this.sdk.logger?.debug(
      `loading pools 7d ago with market compressor ${marketCompressorAddress}`,
    );

    const markets = this.sdk.marketRegister.markets;
    const resp = await this.client.multicall({
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
      blockNumber: BigIntMath.max(0n, targetBlock),
      batchSize: 0,
    });

    this.#pools7DAgo = new AddressMap<Pool7DAgoState>(undefined, MAP_LABEL);
    resp.forEach((r, index) => {
      const m = markets[index];
      const cfg = m.configurator.address;
      const pool = m.pool.pool.address;

      if (r.status === "success") {
        this.#pools7DAgo?.upsert(m.pool.pool.address, {
          dieselRate: r.result.dieselRate,
          pool,
        });
      } else {
        this.sdk.logger?.error(
          `failed to load pools 7d ago for market configurator ${this.labelAddress(cfg)} and pool ${this.labelAddress(pool)}: ${r.error}`,
        );
      }
    });

    return this.state;
  }

  public get loaded(): boolean {
    return !!this.#pools7DAgo;
  }

  /**
   * Returns a map of pool addresses to minified pool 7d ago state
   * @throws if pool 7d ago plugin is not attached
   */
  public get pools7DAgo(): AddressMap<Pool7DAgoState> {
    if (!this.#pools7DAgo) {
      throw new Error("pools 7d ago plugin not attached");
    }
    return this.#pools7DAgo;
  }

  public stateHuman(_?: boolean): Pools7DAgoStateHuman[] {
    return this.pools7DAgo.values().flatMap(p => ({
      address: p.pool,
      version: this.version,
      dieselRate: p.dieselRate,
    }));
  }

  public get state(): Pools7DAgoPluginState {
    return {
      pools7DAgo: this.pools7DAgo.asRecord(),
    };
  }

  public hydrate(state: Pools7DAgoPluginState): void {
    this.#pools7DAgo = new AddressMap(
      Object.entries(state.pools7DAgo),
      MAP_LABEL,
    );
  }
}
