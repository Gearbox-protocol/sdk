import type { NetworkType } from "../../sdk/index.js";
import type { ZapperDataFull } from "./types.js";

/**
 * Temporary zappers
 */
export const extraZappers: Partial<Record<NetworkType, ZapperDataFull[]>> = {
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
  ],
};
