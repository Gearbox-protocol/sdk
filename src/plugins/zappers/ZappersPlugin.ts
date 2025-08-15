import type { Address } from "viem";

import { iPeripheryCompressorAbi } from "../../abi/compressors.js";
import type { IGearboxSDKPlugin } from "../../sdk/index.js";
import {
  AddressMap,
  AP_PERIPHERY_COMPRESSOR,
  BasePlugin,
  hexEq,
  VERSION_RANGE_310,
} from "../../sdk/index.js";
import { extraZappers } from "./extraZappers.js";
import type { ZapperDataFull, ZapperStateHuman } from "./types.js";

export interface ZappersPluginState {
  zappers: Record<Address, ZapperDataFull[]>;
}

export class ZappersPlugin
  extends BasePlugin<ZappersPluginState>
  implements IGearboxSDKPlugin<ZappersPluginState>
{
  #zappers?: AddressMap<ZapperDataFull[]>;

  public async load(force?: boolean): Promise<ZappersPluginState> {
    if (!force && this.loaded) {
      return this.state;
    }

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

    this.#zappers = new AddressMap<ZapperDataFull[]>(undefined, "zappers");
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

    this.#addExtraZappers();

    this.#loadZapperTokens();
    return this.state;
  }

  #addExtraZappers(): void {
    const zaps = extraZappers[this.sdk.provider.networkType] ?? [];
    for (const z of zaps) {
      const existing = this.#zappers?.get(z.pool);
      if (existing) {
        const hasZapper = existing.some(zz =>
          hexEq(zz.baseParams.addr, z.baseParams.addr),
        );
        if (!hasZapper) {
          existing.push(z);
        }
      } else {
        this.#zappers?.upsert(z.pool, [z]);
      }
    }
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
