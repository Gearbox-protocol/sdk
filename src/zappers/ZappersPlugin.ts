import type { Address } from "viem";

import { iPeripheryCompressorAbi } from "../abi/compressors.js";
import type { IGearboxSDKPlugin } from "../sdk/index.js";
import {
  AddressMap,
  AP_PERIPHERY_COMPRESSOR,
  SDKConstruct,
  VERSION_RANGE_310,
} from "../sdk/index.js";
import type { ZapperDataFull, ZapperStateHuman } from "./types.js";

export interface ZappersPluginState {
  zappers: Record<Address, ZapperDataFull[]>;
}

export class ZappersPlugin
  extends SDKConstruct
  implements IGearboxSDKPlugin<ZappersPluginState>
{
  #zappers?: AddressMap<ZapperDataFull[]>;

  public readonly version = 1;

  // public async attach(): Promise<void> {
  //   await this.load(true);
  // }

  public async syncState(): Promise<void> {
    await this.load();
  }

  public async load(force?: boolean): Promise<ZappersPluginState> {
    if (!force && this.loaded) {
      return this.state;
    }

    this.#zappers = new AddressMap<ZapperDataFull[]>(undefined, "zappers");
    const [pcAddr] = this.sdk.addressProvider.mustGetLatest(
      AP_PERIPHERY_COMPRESSOR,
      VERSION_RANGE_310,
    );
    this.sdk.logger?.debug(
      `loading zappers with periphery compressor ${pcAddr}`,
    );
    const markets = this.sdk.marketRegister.markets;
    const resp = await this.provider.publicClient.multicall({
      contracts: markets.map(
        m =>
          ({
            abi: iPeripheryCompressorAbi,
            address: pcAddr,
            functionName: "getZappers",
            args: [m.configurator.address, m.pool.pool.address],
          }) as const,
      ),
      allowFailure: true,
    });

    for (let i = 0; i < resp.length; i++) {
      const { status, result, error } = resp[i];
      const marketConfigurator = markets[i].configurator.address;
      const pool = markets[i].pool.pool.address;

      if (status === "success") {
        this.#zappers.upsert(
          pool,
          result.map(z => ({ ...z, pool })),
        );
      } else {
        this.sdk.logger?.error(
          `failed to load zapper for market configurator ${this.labelAddress(marketConfigurator)} and pool ${this.labelAddress(pool)}: ${error}`,
        );
      }
    }

    this.#loadZapperTokens();
    return this.state;
  }

  public get zappers(): AddressMap<ZapperDataFull[]> {
    if (!this.#zappers) {
      throw new Error("zappers plugin not attached");
    }
    return this.#zappers;
  }

  public get loaded(): boolean {
    return !!this.#zappers;
  }

  public stateHuman(_?: boolean): ZapperStateHuman[] {
    return this.zappers.values().flatMap(l =>
      l.flatMap(z => ({
        address: z.baseParams.addr,
        contractType: z.baseParams.contractType,
        version: Number(z.baseParams.version),
        tokenIn: this.labelAddress(z.tokenIn.addr),
        tokenOut: this.labelAddress(z.tokenOut.addr),
      })),
    );
  }

  public get state(): ZappersPluginState {
    return {
      zappers: this.zappers.asRecord(),
    };
  }

  public hydrate(state: ZappersPluginState): void {
    this.#zappers = new AddressMap(Object.entries(state.zappers), "zappers");
    this.#loadZapperTokens();
  }

  #loadZapperTokens(): void {
    const zappersTokens = this.zappers
      .values()
      .flatMap(l => l.flatMap(z => [z.tokenIn, z.tokenOut]));
    for (const t of zappersTokens) {
      this.sdk.tokensMeta.upsert(t.addr, t);
      this.sdk.provider.addressLabels.set(t.addr as Address, t.symbol);
    }
  }
}
