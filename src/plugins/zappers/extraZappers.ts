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
