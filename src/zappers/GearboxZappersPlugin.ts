import type { Address } from "viem";

import { iPeripheryCompressorAbi } from "../abi/compressors.js";
import {
  AP_PERIPHERY_COMPRESSOR,
  type IGearboxSDKPlugin,
  SDKConstruct,
} from "../sdk/index.js";
import { AddressMap } from "../sdk/index.js";
import type { ZapperData, ZapperDataFull, ZapperStateHuman } from "./types.js";

export class GearboxZappersPlugin
  extends SDKConstruct
  implements IGearboxSDKPlugin
{
  #zappers?: AddressMap<ZapperDataFull[]>;

  public async attach(): Promise<void> {
    await this.loadZappers();
  }

  public async loadZappers(): Promise<void> {
    this.#zappers = new AddressMap<ZapperDataFull[]>(undefined, "zappers");
    const pcAddr = this.sdk.addressProvider.getAddress(
      AP_PERIPHERY_COMPRESSOR,
      3_10,
    );
    this.sdk.logger?.debug(
      `loading zappers with periphery compressor ${pcAddr}`,
    );
    const markets = this.sdk.marketRegister.markets;
    const resp = await this.provider.publicClient.multicall({
      contracts: markets.map(m => ({
        abi: iPeripheryCompressorAbi,
        address: pcAddr,
        functionName: "getZappers",
        args: [m.configurator.address, m.pool.pool.address],
      })),
      allowFailure: true,
    });

    for (let i = 0; i < resp.length; i++) {
      const { status, result, error } = resp[i];
      const marketConfigurator = markets[i].configurator.address;
      const pool = markets[i].pool.pool.address;

      if (status === "success") {
        const list = result as any as ZapperData[];

        this.#zappers.upsert(
          pool,
          list.map(z => ({ ...z, pool })),
        );
      } else {
        this.sdk.logger?.error(
          `failed to load zapper for market configurator ${this.labelAddress(marketConfigurator)} and pool ${this.labelAddress(pool)}: ${error}`,
        );
      }
    }

    const zappersTokens = this.#zappers
      .values()
      .flatMap(l => l.flatMap(z => [z.tokenIn, z.tokenOut]));
    for (const t of zappersTokens) {
      this.sdk.tokensMeta.upsert(t.addr, t);
      this.sdk.provider.addressLabels.set(t.addr as Address, t.symbol);
    }
  }

  public get zappers(): AddressMap<ZapperDataFull[]> {
    if (!this.#zappers) {
      throw new Error("zappers plugin not attached");
    }
    return this.#zappers;
  }

  public stateHuman(raw?: boolean): ZapperStateHuman[] {
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
}
