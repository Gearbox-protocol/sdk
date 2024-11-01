import { Address } from "viem";

export const poolByNetwork = {
  Mainnet: {
    DAI_V1:
      "0x24946bCbBd028D5ABb62ad9B635EB1b1a67AF668".toLowerCase() as Address,
    USDC_V1:
      "0x86130bDD69143D8a4E5fc50bf4323D48049E98E4".toLowerCase() as Address,
    WETH_V1:
      "0xB03670c20F87f2169A7c4eBE35746007e9575901".toLowerCase() as Address,
    WBTC_V1:
      "0xB2A015c71c17bCAC6af36645DEad8c572bA08A08".toLowerCase() as Address,
    WSTETH_V1:
      "0xB8cf3Ed326bB0E51454361Fb37E9E8df6DC5C286".toLowerCase() as Address,
    FRAX_V1:
      "0x79012c8d491dcf3a30db20d1f449b14caf01da6c".toLowerCase() as Address,

    USDC_V3_TRADE:
      "0xda00000035fef4082f78def6a8903bee419fbf8e".toLowerCase() as Address,
    WBTC_V3_TRADE:
      "0xda00010eda646913f273e10e7a5d1f659242757d".toLowerCase() as Address,
    WETH_V3_TRADE:
      "0xda0002859b2d05f66a753d8241fcde8623f26f4f".toLowerCase() as Address,

    USDT_V3_BROKEN:
      "0x1dc0f3359a254f876b37906cfc1000a35ce2d717".toLowerCase() as Address,
    GHO_V3:
      "0x4d56c9cba373ad39df69eb18f076b7348000ae09".toLowerCase() as Address,
    DAI_V3:
      "0xe7146f53dbcae9d6fa3555fe502648deb0b2f823".toLowerCase() as Address,
    USDT_V3:
      "0x05a811275fe9b4de503b3311f51edf6a856d936e".toLowerCase() as Address,
    CRVUSD_V3:
      "0x8ef73f036feec873d0b2fd20892215df5b8bdd72".toLowerCase() as Address,
  },
  Arbitrum: {
    USDC_e_V3:
      "0xa76c604145d7394dec36c49af494c144ff327861".toLowerCase() as Address,
    USDC_V3:
      "0x890a69ef363c9c7bdd5e36eb95ceb569f63acbf6".toLowerCase() as Address,
    WETH_V3:
      "0x04419d3509f13054f60d253e0c79491d9e683399".toLowerCase() as Address,
  },
  Optimism: {
    USDC_V3:
      "0x5520daa93a187f4ec67344e6d2c4fc9b080b6a35".toLowerCase() as Address,
    WETH_V3:
      "0x42db77b3103c71059f4b997d6441cfb299fd0d94".toLowerCase() as Address,
  },
  Base: {},
} as const;
