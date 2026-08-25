import type { Address } from "viem";
import { peripheryCompressorAbi } from "../../abi/compressors/peripheryCompressor.js";
import { SDKConstruct } from "../base/index.js";
import {
  AP_PERIPHERY_COMPRESSOR,
  VERSION_RANGE_310,
} from "../constants/index.js";
import type { ZapperStateHuman } from "../types/index.js";
import { AddressMap, hexEq } from "../utils/index.js";
import type { MulticallBatch } from "../utils/viem/index.js";
import { executeMulticallBatches } from "../utils/viem/index.js";
import type { CompressorZapperData, ZapperData } from "./types.js";
import { createZapper, type IZapperContract } from "./zapper/index.js";

export class ZapperRegister extends SDKConstruct {
  /**
   * Mapping pool.address -> Zapper[]
   * Loaded during SDK attach, or restored by hydration
   */
  #zappers?: AddressMap<IZapperContract[]>;

  /**
   * @internal
   *
   * Returns the multicall batch that loads zappers of all pools from the
   * periphery compressor. Used by the SDK to warm this cache together with
   * other loaders in a single multicall.
   *
   * Returns an empty batch when zappers are already loaded and `force` is not set.
   *
   * @param force - reload zappers even when they are already loaded
   **/
  public getLoadZappersMulticall(force?: boolean): MulticallBatch {
    if (!force && this.#zappers) {
      return { contracts: [], onResults: () => {} };
    }

    // reset upfront, so that the registry counts as loaded (and empty) even when
    // there is nothing to ask the compressor about
    this.#zappers = new AddressMap<IZapperContract[]>(undefined, "zappers");

    const compressor = this.sdk.addressProvider.getLatest(
      AP_PERIPHERY_COMPRESSOR,
      VERSION_RANGE_310,
    );
    if (!compressor) {
      this.logger?.warn(
        "no periphery compressor on this chain, skipping zappers",
      );
      return { contracts: [], onResults: () => {} };
    }
    const [pcAddr] = compressor;
    this.logger?.debug(`loading zappers with periphery compressor ${pcAddr}`);
    const markets = this.sdk.marketRegister.markets;
    return {
      contracts: markets.map(
        m =>
          ({
            abi: peripheryCompressorAbi,
            address: pcAddr,
            functionName: "getZappers",
            args: [m.configurator.address, m.pool.pool.address],
          }) as const,
      ),
      onResults: resps => {
        for (let i = 0; i < resps.length; i++) {
          const { status, result, error } = resps[i];
          const marketConfigurator = markets[i].configurator.address;
          const pool = markets[i].pool.pool.address;

          if (status === "success") {
            for (const z of result as readonly CompressorZapperData[]) {
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
      },
    };
  }

  /**
   * Load zappers for all pools using periphery compressor, adds hardcoded zappers
   *
   * Zappers loaded during SDK attach or restored by hydration are kept unless
   * `force` is set, so calling this after either is a no-op.
   */
  public async loadZappers(force?: boolean): Promise<void> {
    await executeMulticallBatches(this.client, [
      this.getLoadZappersMulticall(force),
    ]);
  }

  /**
   * Serializable snapshot of all loaded zappers, suitable for hydration.
   * Returns `undefined` when zappers were never loaded (i.e. the SDK was
   * attached without market configurators), so the not-loaded state round-trips
   * cleanly.
   **/
  protected get zappersState(): ZapperData[] | undefined {
    if (!this.#zappers) {
      return undefined;
    }
    return this.#zappers.values().flatMap(zappers =>
      zappers.map(z => ({
        pool: z.pool,
        type: z.type,
        baseParams: z.baseParams,
        tokenIn: z.tokenIn,
        tokenOut: z.tokenOut,
      })),
    );
  }

  /**
   * Restores zapper state from a previously serialized snapshot,
   * bypassing on-chain reads.
   * @param state - Array of zapper data snapshots, or `undefined` when zappers
   *   were not loaded in the snapshot (leaves the registry in the not-loaded state).
   **/
  protected hydrateZappers(state?: ZapperData[]): void {
    if (!state) {
      return;
    }
    this.#zappers = new AddressMap<IZapperContract[]>(undefined, "zappers");
    for (const z of state) {
      this.#addZapper(z);
    }
  }

  /**
   * Returns a human-readable snapshot of all loaded zappers.
   * Returns `undefined` when zappers were never loaded.
   * @param raw - When `true`, includes raw/unformatted values.
   **/
  protected zappersStateHuman(_ = true): ZapperStateHuman[] | undefined {
    if (!this.#zappers) {
      return undefined;
    }
    return this.#zappers.values().flatMap(zappers =>
      zappers.map(z => ({
        address: this.labelAddress(z.baseParams.addr),
        contractType: z.contractType,
        type: z.type,
        pool: this.labelAddress(z.pool),
        tokenIn: this.sdk.labelAddress(z.tokenIn.addr),
        tokenOut: this.sdk.labelAddress(z.tokenOut.addr),
      })),
    );
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

  public get zappers(): AddressMap<IZapperContract[]> {
    if (!this.#zappers) {
      throw new Error(
        "zappers are not loaded, check if the sdk was properly attached or hydrated",
      );
    }
    return this.#zappers;
  }

  public poolZappers(pool: Address): IZapperContract[] {
    return this.zappers.get(pool) ?? [];
  }

  /**
   * Can return multiple zappers if there are multiple zappers for the same tokenIn and tokenOut
   */
  public getZapper(
    pool: Address,
    tokenIn: Address,
    tokenOut: Address,
  ): Array<IZapperContract> | undefined {
    const zappers = this.zappers
      .get(pool)
      ?.filter(
        z => hexEq(z.tokenIn.addr, tokenIn) && hexEq(z.tokenOut.addr, tokenOut),
      );
    return zappers;
  }
}
