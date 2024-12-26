import type { ERC4626LPToken } from "./erc4626";
import type { NormalToken } from "./normal";
import type { TokenBase } from "./token";
import type { TokenNetwork } from "./tokenType";
import { TokenType } from "./tokenType";
import type { WrappedToken } from "./wrapped";

export type BalancerLPToken =
  | "USDC_DAI_USDT"
  | "B_rETH_STABLE"
  | "weETH_rETH"
  | "osETH_wETH_BPT"
  | "B_80BAL_20WETH"
  | "50WETH_50AURA"
  | "ezETH_WETH_BPT"
  | "weETH_ezETH_rswETH"
  | "GHO_USDT_USDC"
  | "rsETH_WETH"
  | "trenSTETH"
  | "sUSDe_USDC_BPT"
  | "pumpBTC_WBTC_BPT"
  // Optimism
  | "BPT_rETH_ETH"
  | "BPT_WSTETH_ETH"
  | "BPT_ROAD"
  | "ECLP_wstETH_WETH"
  | "bpt_ethtri"
  // Arbitrum
  | "wstETH_WETH_BPT"
  | "wstETH_rETH_sfrxETH"
  | "wstETH_rETH_cbETH"
  | "rETH_WETH_BPT_deprecated"
  | "cbETH_rETH_wstETH"
  | "rETH_wETH_BPT"
  | "33AURA_33ARB_33BAL"
  | "ezETH_wstETH"
  | "rsETH_wETH_Arb";

export type BalancerLpTokenData = {
  symbol: BalancerLPToken;
  type: Partial<Record<TokenNetwork, TokenType.BALANCER_LP_TOKEN>>;
  underlying: Array<
    NormalToken | WrappedToken | BalancerLPToken | ERC4626LPToken
  >;
  poolId: string;
} & TokenBase;

export const balancerLpTokens: Record<BalancerLPToken, BalancerLpTokenData> = {
  "50WETH_50AURA": {
    name: "Balancer 50WETH-50AURA",
    symbol: "50WETH_50AURA",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["WETH", "AURA"],
    poolId:
      "0xcfca23ca9ca720b6e98e3eb9b6aa0ffc4a5c08b9000200000000000000000274",
  },
  B_80BAL_20WETH: {
    name: "Balancer 80BAL-20WETH",
    symbol: "B_80BAL_20WETH",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["BAL", "WETH"],
    poolId:
      "0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014",
  },

  USDC_DAI_USDT: {
    name: "Balancer USDC_DAI_USDT",
    symbol: "USDC_DAI_USDT",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["USDC", "DAI", "USDT"],
    poolId:
      "0x79c58f70905f734641735bc61e45c19dd9ad60bc0000000000000000000004e7",
  },

  B_rETH_STABLE: {
    name: "Balancer rETH Stable Pool",
    symbol: "B_rETH_STABLE",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["rETH", "WETH"],
    poolId:
      "0x1e19cf2d73a72ef1332c882f20534b6519be0276000200000000000000000112",
  },

  weETH_rETH: {
    name: "Balancer weETH/rETH Stable pool",
    symbol: "weETH_rETH",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["rETH", "weETH"],
    poolId:
      "0x05ff47afada98a98982113758878f9a8b9fdda0a000000000000000000000645",
  },

  osETH_wETH_BPT: {
    name: "Balancer osETH/WETH Stable pool",
    symbol: "osETH_wETH_BPT",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["WETH", "osETH"],
    poolId:
      "0xdacf5fa19b1f720111609043ac67a9818262850c000000000000000000000635",
  },

  ezETH_WETH_BPT: {
    name: "Balancer ezETH/WETH Stable pool",
    symbol: "ezETH_WETH_BPT",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["ezETH", "WETH"],
    poolId:
      "0x596192bb6e41802428ac943d2f1476c1af25cc0e000000000000000000000659",
  },

  sUSDe_USDC_BPT: {
    name: "Balancer sUSDe/USDC Stable pool",
    symbol: "sUSDe_USDC_BPT",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["sUSDe", "USDC"],
    poolId:
      "0xb819feef8f0fcdc268afe14162983a69f6bf179e000000000000000000000689",
  },
  pumpBTC_WBTC_BPT: {
    name: "Balancer pumpBTC/wBTC",
    symbol: "pumpBTC_WBTC_BPT",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["pumpBTC", "WBTC"],
    poolId:
      "0x2238ab6c8c58473a5e81b86ec352322fb3f5edd80000000000000000000006de",
  },

  trenSTETH: {
    name: "Balancer Total Rewards Enhanced stETH",
    symbol: "trenSTETH",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["amphrETH", "rstETH", "wstETH", "Re7LRT", "steakLRT"],
    poolId:
      "0x4216d5900a6109bba48418b5e2ab6cc4e61cf4770000000000000000000006a1",
  },

  weETH_ezETH_rswETH: {
    name: "Balancer ezETH/weETH/rswETH",
    symbol: "weETH_ezETH_rswETH",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["ezETH", "weETH", "rswETH"],
    poolId:
      "0x848a5564158d84b8a8fb68ab5d004fae11619a5400000000000000000000066a",
  },

  GHO_USDT_USDC: {
    name: "Balancer GHO/USDT/USDC",
    symbol: "GHO_USDT_USDC",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["GHO", "USDC", "USDT"],
    poolId:
      "0x8353157092ed8be69a9df8f95af097bbf33cb2af0000000000000000000005d9",
  },
  rsETH_WETH: {
    name: "Balancer rsETH/WETH Stable",
    symbol: "rsETH_WETH",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["rsETH", "WETH"],
    poolId:
      "0x58aadfb1afac0ad7fca1148f3cde6aedf5236b6d00000000000000000000067f",
  },

  rsETH_wETH_Arb: {
    name: "Balancer rsETH/WETH Pool (Arbitrum)",
    symbol: "rsETH_wETH_Arb",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["rsETH", "WETH"],
    poolId:
      "0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd73900000000000000000000055c",
  },

  BPT_rETH_ETH: {
    name: "BeethovenX rETH-ETH Pool",
    symbol: "BPT_rETH_ETH",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["WETH", "rETH"],
    poolId:
      "0x4fd63966879300cafafbb35d157dc5229278ed2300020000000000000000002b",
  },

  BPT_WSTETH_ETH: {
    name: "BeethovenX wstETH-ETH Pool",
    symbol: "BPT_WSTETH_ETH",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["wstETH", "WETH"],
    poolId:
      "0x7b50775383d3d6f0215a8f290f2c9e2eebbeceb200020000000000000000008b",
  },

  BPT_ROAD: {
    name: "BeethovenX WETH-OP-USDC Pool",
    symbol: "BPT_ROAD",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["WETH", "OP", "USDC"],
    poolId:
      "0x39965c9dab5448482cf7e002f583c812ceb53046000100000000000000000003",
  },

  ECLP_wstETH_WETH: {
    name: "BeethovenX ECLP wstETH-ETH Pool",
    symbol: "ECLP_wstETH_WETH",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["wstETH", "WETH"],
    poolId:
      "0x7ca75bdea9dede97f8b13c6641b768650cb837820002000000000000000000d5",
  },

  wstETH_WETH_BPT: {
    name: "Balancer wstETH/WETH Pool (Arbitrum)",
    symbol: "wstETH_WETH_BPT",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["wstETH", "WETH"],
    poolId:
      "0x9791d590788598535278552eecd4b211bfc790cb000000000000000000000498",
  },

  wstETH_rETH_sfrxETH: {
    name: "Balancer wstETH/rETH/sfrxETH Pool (Arbitrum)",
    symbol: "wstETH_rETH_sfrxETH",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["wstETH", "rETH", "sfrxETH"],
    poolId:
      "0x0c8972437a38b389ec83d1e666b69b8a4fcf8bfd00000000000000000000049e",
  },
  wstETH_rETH_cbETH: {
    name: "Balancer wstETH/rETH/cbETH Pool (Arbitrum)",
    symbol: "wstETH_rETH_cbETH",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["cbETH", "wstETH", "rETH"],
    poolId:
      "0x4a2f6ae7f3e5d715689530873ec35593dc28951b000000000000000000000481",
  },

  cbETH_rETH_wstETH: {
    name: "Balancer wstETH/rETH/cbETH Pool (Arbitrum)",
    symbol: "cbETH_rETH_wstETH",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["cbETH", "wstETH", "rETH"],
    poolId:
      "0x2d6ced12420a9af5a83765a8c48be2afcd1a8feb000000000000000000000500",
  },

  rETH_WETH_BPT_deprecated: {
    name: "Balancer rETH/WETH Pool (Arbitrum)",
    symbol: "rETH_WETH_BPT_deprecated",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["WETH", "rETH"],
    poolId:
      "0xade4a71bb62bec25154cfc7e6ff49a513b491e81000000000000000000000497",
  },

  rETH_wETH_BPT: {
    name: "Balancer rETH/WETH Pool (Arbitrum)",
    symbol: "rETH_wETH_BPT",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["WETH", "rETH"],
    poolId:
      "0xd0ec47c54ca5e20aaae4616c25c825c7f48d40690000000000000000000004ef",
  },

  "33AURA_33ARB_33BAL": {
    name: "Balancer AURA/ARB/BAL Pool (Arbitrum)",
    symbol: "33AURA_33ARB_33BAL",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["BAL", "AURA", "ARB"],
    poolId:
      "0xbcaa6c053cab3dd73a2e898d89a4f84a180ae1ca000100000000000000000458",
  },
  ezETH_wstETH: {
    name: "Balancer ezETH/wstETH (Arbitrum)",
    symbol: "ezETH_wstETH",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["ezETH", "wstETH"],
    poolId:
      "0xb61371ab661b1acec81c699854d2f911070c059e000000000000000000000516",
  },
  bpt_ethtri: {
    name: "Ethereum Triplets",
    symbol: "bpt_ethtri",
    type: {
      AllNetworks: TokenType.BALANCER_LP_TOKEN,
    },
    underlying: ["wstETH", "sfrxETH", "rETH"],
    poolId:
      "0x5f8893506ddc4c271837187d14a9c87964a074dc000000000000000000000106",
  },
};

export const isBalancerLPToken = (t: unknown): t is BalancerLPToken =>
  typeof t === "string" && !!balancerLpTokens[t as BalancerLPToken];
