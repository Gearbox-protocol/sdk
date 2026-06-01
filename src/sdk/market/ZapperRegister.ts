import type { Address } from "viem";
import { peripheryCompressorAbi } from "../../abi/compressors/peripheryCompressor.js";
import { SDKConstruct } from "../base/index.js";
import {
  AP_PERIPHERY_COMPRESSOR,
  VERSION_RANGE_310,
} from "../constants/index.js";
import { AddressMap, hexEq } from "../utils/index.js";
import type { ZapperData } from "./types.js";
import { createZapper, type Zapper } from "./zapper/index.js";

export class ZapperRegister extends SDKConstruct {
  /**
   * Mapping pool.address -> Zapper[]
   * Needs to be loaded explicitly using loadZappers method
   */
  #zappers?: AddressMap<Zapper[]>;

  /**
   * Load zappers for all pools using periphery compressor, adds hardcoded zappers
   */
  public async loadZappers(force?: boolean): Promise<void> {
    if (!force && this.#zappers) {
      return;
    }

    const [pcAddr] = this.sdk.addressProvider.mustGetLatest(
      AP_PERIPHERY_COMPRESSOR,
      VERSION_RANGE_310,
    );
    this.logger?.debug(`loading zappers with periphery compressor ${pcAddr}`);
    const markets = this.sdk.marketRegister.markets;
    const resp = await this.client.multicall({
      contracts: markets.map(
        m =>
          ({
            abi: peripheryCompressorAbi,
            address: pcAddr,
            functionName: "getZappers",
            args: [m.configurator.address, m.pool.pool.address],
          }) as const,
      ),
      allowFailure: true,
      batchSize: 0,
    });

    this.#zappers = new AddressMap<Zapper[]>(undefined, "zappers");
    for (let i = 0; i < resp.length; i++) {
      const { status, result, error } = resp[i];
      const marketConfigurator = markets[i].configurator.address;
      const pool = markets[i].pool.pool.address;

      if (status === "success") {
        for (const z of result) {
          this.#addZapper({ ...z, pool, type: "base" });
        }
      } else {
        this.logger?.error(
          `failed to load zapper for market configurator ${this.labelAddress(
            marketConfigurator,
          )} and pool ${this.labelAddress(pool)}: ${error}`,
        );
      }
    }
  }

  #addZapper(z: ZapperData): void {
    const zapper = createZapper(this.sdk, z);
    const existing = this.zappers.get(z.pool);
    if (existing) {
      const hasZapper = existing.some(zz =>
        hexEq(zz.baseParams.addr, z.baseParams.addr),
      );
      if (!hasZapper) {
        existing.push(zapper);
      }
    } else {
      this.zappers.upsert(z.pool, [zapper]);
    }
    const zappersTokens = [z.tokenIn, z.tokenOut];
    for (const t of zappersTokens) {
      this.sdk.tokensMeta.upsert(t.addr, t);
      this.sdk.setAddressLabel(t.addr, t.symbol);
    }
  }

  public get zappers(): AddressMap<Zapper[]> {
    if (!this.#zappers) {
      throw new Error("zappers not loaded, call loadZappers first");
    }
    return this.#zappers;
  }

  public poolZappers(pool: Address): Zapper[] {
    return this.zappers.get(pool) ?? [];
  }

  /**
   * Can return multiple zappers if there are multiple zappers for the same tokenIn and tokenOut
   */
  public getZapper(
    pool: Address,
    tokenIn: Address,
    tokenOut: Address,
  ): Array<Zapper> | undefined {
    const zappers = this.zappers
      .get(pool)
      ?.filter(
        z => hexEq(z.tokenIn.addr, tokenIn) && hexEq(z.tokenOut.addr, tokenOut),
      );
    return zappers;
  }
}
