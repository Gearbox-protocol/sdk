import type { NetworkType } from "../../sdk/index.js";
import type { ZapperDataFull } from "./types.js";

/**
 * Temporary zappers
 */
export const extraZappers: Partial<Record<NetworkType, ZapperDataFull[]>> = {
  Mainnet: [
    {
      baseParams: {
        addr: "0x2512bb303b66C541C32D764F65eCdB62875F0140",
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
        addr: "0xC155444481854c60e7a29f4150373f479988F32D",
        symbol: "USDC",
        name: "USDC",
        decimals: 6,
      },
      pool: "0xC155444481854c60e7a29f4150373f479988F32D",
    },
    {
      baseParams: {
        addr: "0x18b33ee1cd4cb7912867d0b2cc8678a78f82136b",
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
        addr: "0xf00B548f1b69cB5EE559d891E03A196FB5101d4A",
        symbol: "dWETHV3-cp0x",
        name: "Gearbox WETH v3",
        decimals: 18,
      },
      pool: "0xf00B548f1b69cB5EE559d891E03A196FB5101d4A",
    },

    {
      baseParams: {
        addr: "0x17897d188bb49fea7bfac56e29b07036e16b3537",
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
        addr: "0xC155444481854c60e7a29f4150373f479988F32D",
        symbol: "USDC",
        name: "USDC",
        decimals: 6,
      },
      pool: "0xC155444481854c60e7a29f4150373f479988F32D",
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
        name: "Resolv USDC",
        decimals: 6,
      },
      pool: "0xF0795C47fA58d00f5F77F4D5c01F31eE891E21B4",
    },
    {
      baseParams: {
        addr: "0x2bC0231a1FC6a9b2E0C44AC1089F47a122a7a8c1",
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
        addr: "0xf00B548f1b69cB5EE559d891E03A196FB5101d4A",
        symbol: "dWETHV3-cp0x",
        name: "Gearbox WETH v3",
        decimals: 18,
      },
      pool: "0xf00B548f1b69cB5EE559d891E03A196FB5101d4A",
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
        name: "Resolv USDC",
        decimals: 6,
      },
      pool: "0xF0795C47fA58d00f5F77F4D5c01F31eE891E21B4",
    },
  ],
};
