import type { Address } from "viem";
import { peripheryCompressorAbi } from "../../abi/compressors/peripheryCompressor.js";
import { SDKConstruct } from "../base/index.js";
import type { NetworkType } from "../chain/index.js";
import {
  AP_PERIPHERY_COMPRESSOR,
  VERSION_RANGE_310,
} from "../constants/index.js";
import { AddressMap, hexEq } from "../utils/index.js";
import type { ZapperData } from "./types.js";

export class ZapperRegister extends SDKConstruct {
  /**
   * Mapping pool.address -> ZapperData[]
   * Needs to be loaded explicitly using loadZappers method
   */
  #zappers?: AddressMap<ZapperData[]>;

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

    this.#zappers = new AddressMap<ZapperData[]>(undefined, "zappers");
    for (let i = 0; i < resp.length; i++) {
      const { status, result, error } = resp[i];
      const marketConfigurator = markets[i].configurator.address;
      const pool = markets[i].pool.pool.address;

      if (status === "success") {
        for (const z of result) {
          this.#addZapper({ ...z, pool });
        }
      } else {
        this.logger?.error(
          `failed to load zapper for market configurator ${this.labelAddress(
            marketConfigurator,
          )} and pool ${this.labelAddress(pool)}: ${error}`,
        );
      }
    }

    for (const z of EXTRA_ZAPPERS[this.networkType] ?? []) {
      this.#addZapper(z);
    }
  }

  #addZapper(z: ZapperData): void {
    const existing = this.zappers.get(z.pool);
    if (existing) {
      const hasZapper = existing.some(zz =>
        hexEq(zz.baseParams.addr, z.baseParams.addr),
      );
      if (!hasZapper) {
        existing.push(z);
      }
    } else {
      this.zappers.upsert(z.pool, [z]);
    }
    const zappersTokens = [z.tokenIn, z.tokenOut];
    for (const t of zappersTokens) {
      this.sdk.tokensMeta.upsert(t.addr, t);
      this.sdk.setAddressLabel(t.addr, t.symbol);
    }
  }

  public get zappers(): AddressMap<ZapperData[]> {
    if (!this.#zappers) {
      throw new Error("zappers not loaded, call loadZappers first");
    }
    return this.#zappers;
  }

  public poolZappers(pool: Address): ZapperData[] {
    return this.zappers.get(pool) ?? [];
  }

  public getZapper(
    pool: Address,
    tokenIn: Address,
    tokenOut: Address,
  ): ZapperData | undefined {
    return this.zappers
      .get(pool)
      ?.find(
        z => hexEq(z.tokenIn.addr, tokenIn) && hexEq(z.tokenOut.addr, tokenOut),
      );
  }
}

/**
 * Temporary zappers
 *
 * On paper we have periphery compressor, but we don't use it because we don't add zappers to market configurator as periphery contract and this is unnecessary action for risk curator
 * Zappers for KYC markets are always in compressor, though
 */
const EXTRA_ZAPPERS: Partial<Record<NetworkType, ZapperData[]>> = {
  Mainnet: [
    {
      baseParams: {
        addr: "0x85f540c9d5b3be85dbad54085aa18d49e23cd254",
        version: 310n,
        contractType:
          "0x5a41505045523a3a5354414b45445f4552433436323600000000000000000000",
        serializedParams:
          "0x0000000000000000000000000418feb7d0b25c411eb77cd654305d29fcbff685000000000000000000000000da0002859b2d05f66a753d8241fcde8623f26f4f",
      },
      tokenIn: {
        addr: "0x0418fEB7d0B25C411EB77cD654305d29FcbFf685",
        symbol: "farmdWETHV3",
        name: "Farming of Trade WETH v3",
        decimals: 18,
      },
      tokenOut: {
        addr: "0x9396DCbf78fc526bb003665337C5E73b699571EF",
        symbol: "kpkWETH",
        name: "WETH Market",
        decimals: 18,
      },
      pool: "0x9396DCbf78fc526bb003665337C5E73b699571EF",
    },
    {
      baseParams: {
        addr: "0x5A5F69e134765Cb0169f280c2f2A7d8AdF8eFd29",
        version: 310n,
        contractType:
          "0x5a41505045523a3a455243343632360000000000000000000000000000000000",
        serializedParams:
          "0x000000000000000000000000da0002859b2d05f66a753d8241fcde8623f26f4f",
      },
      tokenIn: {
        addr: "0xda0002859B2d05F66a753d8241fCDE8623f26F4f",
        symbol: "dWETHV3",
        name: "Trade WETH v3",
        decimals: 18,
      },
      tokenOut: {
        addr: "0x9396DCbf78fc526bb003665337C5E73b699571EF",
        symbol: "kpkWETH",
        name: "WETH Market",
        decimals: 18,
      },
      pool: "0x9396DCbf78fc526bb003665337C5E73b699571EF",
    },
    {
      baseParams: {
        addr: "0xbff5E156779aDCE4C61ecc6bCc32cba89eD7dfa6",
        version: 310n,
        contractType:
          "0x5a41505045523a3a455243343632360000000000000000000000000000000000",
        serializedParams:
          "0x000000000000000000000000ff94993fa7ea27efc943645f95adb36c1b81244b",
      },
      tokenIn: {
        addr: "0xFF94993fA7EA27Efc943645F95Adb36C1b81244b",
        symbol: "dWSTETHV3",
        name: "wstETH v3",
        decimals: 18,
      },
      tokenOut: {
        addr: "0xA9d17f6D3285208280a1Fd9B94479c62e0AABa64",
        symbol: "kpkwstETH",
        name: "wstETH v3",
        decimals: 18,
      },
      pool: "0xA9d17f6D3285208280a1Fd9B94479c62e0AABa64",
    },
    {
      baseParams: {
        addr: "0x62af1fc6e54e66aba5322a3491b5ce1808a6fe89",
        version: 310n,
        contractType:
          "0x5a41505045523a3a455243343632360000000000000000000000000000000000",
        serializedParams:
          "0x000000000000000000000000da00000035fef4082f78def6a8903bee419fbf8e",
      },
      tokenIn: {
        addr: "0xda00000035fef4082F78dEF6A8903bee419FbF8E",
        symbol: "dUSDCV3",
        name: "Trade USDC v3",
        decimals: 6,
      },
      tokenOut: {
        addr: "0xF0795C47fA58d00f5F77F4D5c01F31eE891E21B4",
        symbol: "rUSDC",
        name: "Tulipa USDC",
        decimals: 6,
      },
      pool: "0xF0795C47fA58d00f5F77F4D5c01F31eE891E21B4",
    },
    {
      baseParams: {
        addr: "0x70383bac778f0285ddb5f35afbd631e5a4675c58",
        version: 310n,
        contractType:
          "0x5a41505045523a3a5354414b45445f4552433436323600000000000000000000",
        serializedParams:
          "0x0000000000000000000000009ef444a6d7f4a5adcd68fd5329aa5240c90e14d2000000000000000000000000da00000035fef4082f78def6a8903bee419fbf8e",
      },
      tokenIn: {
        addr: "0x9ef444a6d7F4A5adcd68FD5329aA5240C90E14d2",
        symbol: "farmdUSDCV3",
        name: "Farming of Trade USDC v3",
        decimals: 6,
      },
      tokenOut: {
        addr: "0xF0795C47fA58d00f5F77F4D5c01F31eE891E21B4",
        symbol: "rUSDC",
        name: "Tulipa USDC",
        decimals: 6,
      },
      pool: "0xF0795C47fA58d00f5F77F4D5c01F31eE891E21B4",
    },
  ],
};
