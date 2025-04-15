import type {
  ConvexPoolContract,
  SupportedContract,
} from "../contracts/index.js";
import type { CurveLPToken } from "./curveLP.js";
import type { SupportedToken, TokenBase } from "./token.js";
import type { TokenNetwork } from "./tokenType.js";
import { TokenType } from "./tokenType.js";

export type ConvexLPToken =
  | "cvx3Crv"
  | "cvxcrvFRAX"
  | "cvxsteCRV"
  | "cvxFRAX3CRV"
  | "cvxLUSD3CRV"
  | "cvxcrvPlain3andSUSD"
  | "cvxgusd3CRV"
  | "cvxcrvCRVETH"
  | "cvxcrvCVXETH"
  | "cvxcrvUSDTWBTCWETH"
  | "cvxLDOETH"
  | "cvxcrvUSDUSDC"
  | "cvxcrvUSDUSDT"
  | "cvxcrvUSDFRAX"
  | "cvxcrvUSDETHCRV"
  | "cvxGHOcrvUSD"
  | "cvxllamathena"
  | "cvxRLUSDUSDC";

export type ConvexStakedPhantomToken =
  | "stkcvx3Crv"
  | "stkcvxcrvFRAX"
  | "stkcvxsteCRV"
  | "stkcvxFRAX3CRV"
  | "stkcvxLUSD3CRV"
  | "stkcvxcrvPlain3andSUSD"
  | "stkcvxgusd3CRV"
  | "stkcvxcrvCRVETH"
  | "stkcvxcrvCVXETH"
  | "stkcvxcrvUSDTWBTCWETH"
  | "stkcvxLDOETH"
  | "stkcvxcrvUSDUSDC"
  | "stkcvxcrvUSDUSDT"
  | "stkcvxcrvUSDFRAX"
  | "stkcvxcrvUSDETHCRV"
  | "stkcvxGHOcrvUSD"
  | "stkcvxllamathena"
  | "stkcvxRLUSDUSDC";

export type ConvexL2StakedToken = "cvxcrvUSDT";

type BaseConvexToken = {
  pool: ConvexPoolContract;
  pid: number;
  underlying: CurveLPToken;
} & TokenBase;

export type ConvexLPTokenData = {
  symbol: ConvexLPToken;
  type: Partial<Record<TokenNetwork, TokenType.CONVEX_LP_TOKEN>>;
  stakedToken: ConvexStakedPhantomToken;
} & BaseConvexToken;

export type ConvexPhantomTokenData = {
  symbol: ConvexStakedPhantomToken;
  type: Partial<Record<TokenNetwork, TokenType.CONVEX_STAKED_TOKEN>>;
  lpToken: ConvexLPToken;
} & BaseConvexToken;

export type ConvexL2StakedTokenData = {
  symbol: ConvexL2StakedToken;
  type: Partial<Record<TokenNetwork, TokenType.CONVEX_L2_STAKED_TOKEN>>;
} & BaseConvexToken;

export const convexLpTokens: Record<ConvexLPToken, ConvexLPTokenData> = {
  cvx3Crv: {
    name: "Convex cvx3Crv",

    symbol: "cvx3Crv",
    type: {
      AllNetworks: TokenType.CONVEX_LP_TOKEN,
    },
    pool: "CONVEX_3CRV_POOL",
    pid: 9,
    underlying: "3Crv",
    stakedToken: "stkcvx3Crv",
  },

  cvxcrvFRAX: {
    name: "Convex cvxcrvFRAX",

    symbol: "cvxcrvFRAX",
    type: {
      AllNetworks: TokenType.CONVEX_LP_TOKEN,
    },
    pool: "CONVEX_FRAX_USDC_POOL",
    pid: 100,
    underlying: "crvFRAX",
    stakedToken: "stkcvxcrvFRAX",
  },

  cvxsteCRV: {
    name: "Convex cvxsteCRV",

    symbol: "cvxsteCRV",
    type: {
      AllNetworks: TokenType.CONVEX_LP_TOKEN,
    },
    pool: "CONVEX_STECRV_POOL",
    pid: 25,
    underlying: "steCRV",
    stakedToken: "stkcvxsteCRV",
  },

  cvxFRAX3CRV: {
    name: "Convex cvxFRAX3CRV-f",

    symbol: "cvxFRAX3CRV",
    type: {
      AllNetworks: TokenType.CONVEX_LP_TOKEN,
    },
    pool: "CONVEX_FRAX3CRV_POOL",
    pid: 32,
    underlying: "FRAX3CRV",
    stakedToken: "stkcvxFRAX3CRV",
  },

  cvxLUSD3CRV: {
    name: "Convex cvxLUSD3CRV-f",

    symbol: "cvxLUSD3CRV",
    type: {
      AllNetworks: TokenType.CONVEX_LP_TOKEN,
    },
    pool: "CONVEX_LUSD3CRV_POOL",
    pid: 33,
    underlying: "LUSD3CRV",
    stakedToken: "stkcvxLUSD3CRV",
  },

  cvxcrvPlain3andSUSD: {
    name: "Convex cvxcrvPlain3andSUSD",

    symbol: "cvxcrvPlain3andSUSD",
    type: {
      AllNetworks: TokenType.CONVEX_LP_TOKEN,
    },
    pool: "CONVEX_SUSD_POOL",
    pid: 4,
    underlying: "crvPlain3andSUSD",
    stakedToken: "stkcvxcrvPlain3andSUSD",
  },

  cvxgusd3CRV: {
    name: "Convex cvxgusd3CRV",

    symbol: "cvxgusd3CRV",
    type: {
      AllNetworks: TokenType.CONVEX_LP_TOKEN,
    },
    pool: "CONVEX_GUSD_POOL",
    pid: 10,
    underlying: "gusd3CRV",
    stakedToken: "stkcvxgusd3CRV",
  },

  cvxcrvCRVETH: {
    name: "Convex cvxcrvCRVETH",

    symbol: "cvxcrvCRVETH",
    type: {
      AllNetworks: TokenType.CONVEX_LP_TOKEN,
    },
    pool: "CONVEX_CRVETH_POOL",
    pid: 61,
    underlying: "crvCRVETH",
    stakedToken: "stkcvxcrvCRVETH",
  },

  cvxcrvCVXETH: {
    name: "Convex cvxcrvCVXETH",

    symbol: "cvxcrvCVXETH",
    type: {
      AllNetworks: TokenType.CONVEX_LP_TOKEN,
    },
    pool: "CONVEX_CVXETH_POOL",
    pid: 64,
    underlying: "crvCVXETH",
    stakedToken: "stkcvxcrvCVXETH",
  },

  cvxcrvUSDTWBTCWETH: {
    name: "Convex cvxcrvUSDTWBTCWETH",

    symbol: "cvxcrvUSDTWBTCWETH",
    type: {
      AllNetworks: TokenType.CONVEX_LP_TOKEN,
    },
    pool: "CONVEX_3CRYPTO_POOL",
    pid: 188,
    underlying: "crvUSDTWBTCWETH",
    stakedToken: "stkcvxcrvUSDTWBTCWETH",
  },

  cvxLDOETH: {
    name: "Convex cvxLDOETH",
    symbol: "cvxLDOETH",
    type: {
      AllNetworks: TokenType.CONVEX_LP_TOKEN,
    },
    pool: "CONVEX_LDOETH_POOL",
    pid: 149,
    underlying: "LDOETH",
    stakedToken: "stkcvxLDOETH",
  },

  cvxcrvUSDUSDC: {
    name: "Convex cvxcrvUSDUSDC",
    symbol: "cvxcrvUSDUSDC",
    type: {
      AllNetworks: TokenType.CONVEX_LP_TOKEN,
    },
    pool: "CONVEX_CRVUSD_USDC_POOL",
    pid: 182,
    underlying: "crvUSDUSDC",
    stakedToken: "stkcvxcrvUSDUSDC",
  },

  cvxcrvUSDUSDT: {
    name: "Convex cvxcrvUSDUSDT",
    symbol: "cvxcrvUSDUSDT",
    type: {
      AllNetworks: TokenType.CONVEX_LP_TOKEN,
    },
    pool: "CONVEX_CRVUSD_USDT_POOL",
    pid: 179,
    underlying: "crvUSDUSDT",
    stakedToken: "stkcvxcrvUSDUSDT",
  },

  cvxcrvUSDFRAX: {
    name: "Convex cvxcrvUSDFRAX",
    symbol: "cvxcrvUSDFRAX",
    type: {
      AllNetworks: TokenType.CONVEX_LP_TOKEN,
    },
    pool: "CONVEX_CRVUSD_FRAX_POOL",
    pid: 187,
    underlying: "crvUSDFRAX",
    stakedToken: "stkcvxcrvUSDFRAX",
  },

  cvxcrvUSDETHCRV: {
    name: "Convex cvxcrvUSDETHCRV",
    symbol: "cvxcrvUSDETHCRV",
    type: {
      AllNetworks: TokenType.CONVEX_LP_TOKEN,
    },
    pool: "CONVEX_TRI_CRV_POOL",
    pid: 211,
    underlying: "crvUSDETHCRV",
    stakedToken: "stkcvxcrvUSDETHCRV",
  },

  cvxGHOcrvUSD: {
    name: "Convex cvxGHOcrvUSD",
    symbol: "cvxGHOcrvUSD",
    type: {
      AllNetworks: TokenType.CONVEX_LP_TOKEN,
    },
    pool: "CONVEX_GHO_CRVUSD_POOL",
    pid: 335,
    underlying: "GHOcrvUSD",
    stakedToken: "stkcvxGHOcrvUSD",
  },

  cvxllamathena: {
    name: "Convex cvxllamathena",
    symbol: "cvxllamathena",
    type: {
      AllNetworks: TokenType.CONVEX_LP_TOKEN,
    },
    pool: "CONVEX_LLAMA_THENA_POOL",
    pid: 401,
    underlying: "llamathena",
    stakedToken: "stkcvxllamathena",
  },

  cvxRLUSDUSDC: {
    name: "Convex cvxRLUSDUSDC",
    symbol: "cvxRLUSDUSDC",
    type: {
      AllNetworks: TokenType.CONVEX_LP_TOKEN,
    },
    pool: "CONVEX_RLUSD_USDC_POOL",
    pid: 443,
    underlying: "RLUSDUSDC",
    stakedToken: "stkcvxRLUSDUSDC",
  },
};

export const convexStakedPhantomTokens: Record<
  ConvexStakedPhantomToken,
  ConvexPhantomTokenData
> = {
  stkcvx3Crv: {
    name: "Convex stkcvx3Crv",
    symbol: "stkcvx3Crv",
    type: {
      AllNetworks: TokenType.CONVEX_STAKED_TOKEN,
    },
    pool: "CONVEX_3CRV_POOL",
    pid: 9,
    underlying: "3Crv",
    lpToken: "cvx3Crv",
  },

  stkcvxcrvFRAX: {
    name: "Convex stkcvxcrvFRAX",
    symbol: "stkcvxcrvFRAX",
    type: {
      AllNetworks: TokenType.CONVEX_STAKED_TOKEN,
    },
    pool: "CONVEX_FRAX_USDC_POOL",
    pid: 100,
    underlying: "crvFRAX",
    lpToken: "cvxcrvFRAX",
  },

  stkcvxsteCRV: {
    name: "Convex stkcvxsteCRV",

    symbol: "stkcvxsteCRV",
    type: {
      AllNetworks: TokenType.CONVEX_STAKED_TOKEN,
    },
    pool: "CONVEX_STECRV_POOL",
    pid: 25,
    underlying: "steCRV",
    lpToken: "cvxsteCRV",
  },

  stkcvxFRAX3CRV: {
    name: "Convex stkcvxFRAX3CRV-f",

    symbol: "stkcvxFRAX3CRV",
    type: {
      AllNetworks: TokenType.CONVEX_STAKED_TOKEN,
    },
    pool: "CONVEX_FRAX3CRV_POOL",
    pid: 32,
    underlying: "FRAX3CRV",
    lpToken: "cvxFRAX3CRV",
  },

  stkcvxLUSD3CRV: {
    name: "Convex stkcvxLUSD3CRV-f",

    symbol: "stkcvxLUSD3CRV",
    type: {
      AllNetworks: TokenType.CONVEX_STAKED_TOKEN,
    },
    pool: "CONVEX_LUSD3CRV_POOL",
    pid: 33,
    underlying: "LUSD3CRV",
    lpToken: "cvxLUSD3CRV",
  },

  stkcvxcrvPlain3andSUSD: {
    name: "Convex stkcvxcrvPlain3andSUSD",

    symbol: "stkcvxcrvPlain3andSUSD",
    type: {
      AllNetworks: TokenType.CONVEX_STAKED_TOKEN,
    },
    pool: "CONVEX_SUSD_POOL",
    pid: 4,
    underlying: "crvPlain3andSUSD",
    lpToken: "cvxcrvPlain3andSUSD",
  },

  stkcvxgusd3CRV: {
    name: "Convex stkcvxgusd3CRV",

    symbol: "stkcvxgusd3CRV",
    type: {
      AllNetworks: TokenType.CONVEX_STAKED_TOKEN,
    },
    pool: "CONVEX_GUSD_POOL",
    pid: 10,
    underlying: "gusd3CRV",
    lpToken: "cvxgusd3CRV",
  },

  stkcvxcrvCRVETH: {
    name: "Convex stkcvxcrvCRVETH",

    symbol: "stkcvxcrvCRVETH",
    type: {
      AllNetworks: TokenType.CONVEX_STAKED_TOKEN,
    },
    pool: "CONVEX_CRVETH_POOL",
    pid: 61,
    underlying: "crvCRVETH",
    lpToken: "cvxcrvCRVETH",
  },

  stkcvxcrvCVXETH: {
    name: "Convex stkcvxcrvCVXETH",

    symbol: "stkcvxcrvCVXETH",
    type: {
      AllNetworks: TokenType.CONVEX_STAKED_TOKEN,
    },
    pool: "CONVEX_CVXETH_POOL",
    pid: 64,
    underlying: "crvCVXETH",
    lpToken: "cvxcrvCVXETH",
  },

  stkcvxcrvUSDTWBTCWETH: {
    name: "Convex stkcvxcrv3crypto",

    symbol: "stkcvxcrvUSDTWBTCWETH",
    type: {
      AllNetworks: TokenType.CONVEX_STAKED_TOKEN,
    },
    pool: "CONVEX_3CRYPTO_POOL",
    pid: 188,
    underlying: "crvUSDTWBTCWETH",
    lpToken: "cvxcrvUSDTWBTCWETH",
  },

  stkcvxLDOETH: {
    name: "Convex stkcvxLDOETH",

    symbol: "stkcvxLDOETH",
    type: {
      AllNetworks: TokenType.CONVEX_STAKED_TOKEN,
    },
    pool: "CONVEX_LDOETH_POOL",
    pid: 149,
    underlying: "LDOETH",
    lpToken: "cvxLDOETH",
  },

  stkcvxcrvUSDUSDC: {
    name: "Convex stkcvxcrvUSDUSDC",
    symbol: "stkcvxcrvUSDUSDC",
    type: {
      AllNetworks: TokenType.CONVEX_STAKED_TOKEN,
    },
    pool: "CONVEX_CRVUSD_USDC_POOL",
    pid: 182,
    underlying: "crvUSDUSDC",
    lpToken: "cvxcrvUSDUSDC",
  },

  stkcvxcrvUSDUSDT: {
    name: "Convex stkcvxcrvUSDUSDT",
    symbol: "stkcvxcrvUSDUSDT",
    type: {
      AllNetworks: TokenType.CONVEX_STAKED_TOKEN,
    },
    pool: "CONVEX_CRVUSD_USDT_POOL",
    pid: 179,
    underlying: "crvUSDUSDT",
    lpToken: "cvxcrvUSDUSDT",
  },

  stkcvxcrvUSDFRAX: {
    name: "Convex stkcvxcrvUSDFRAX",
    symbol: "stkcvxcrvUSDFRAX",
    type: {
      AllNetworks: TokenType.CONVEX_STAKED_TOKEN,
    },
    pool: "CONVEX_CRVUSD_FRAX_POOL",
    pid: 187,
    underlying: "crvUSDFRAX",
    lpToken: "cvxcrvUSDFRAX",
  },

  stkcvxcrvUSDETHCRV: {
    name: "Convex stkcvxcrvUSDETHCRV",
    symbol: "stkcvxcrvUSDETHCRV",
    type: {
      AllNetworks: TokenType.CONVEX_STAKED_TOKEN,
    },
    pool: "CONVEX_TRI_CRV_POOL",
    pid: 211,
    underlying: "crvUSDETHCRV",
    lpToken: "cvxcrvUSDETHCRV",
  },

  stkcvxGHOcrvUSD: {
    name: "Convex stkcvxGHOcrvUSD",
    symbol: "stkcvxGHOcrvUSD",
    type: {
      AllNetworks: TokenType.CONVEX_STAKED_TOKEN,
    },
    pool: "CONVEX_GHO_CRVUSD_POOL",
    pid: 335,
    underlying: "GHOcrvUSD",
    lpToken: "cvxGHOcrvUSD",
  },

  stkcvxllamathena: {
    name: "Convex stkcvxllamathena",
    symbol: "stkcvxllamathena",
    type: {
      AllNetworks: TokenType.CONVEX_STAKED_TOKEN,
    },
    pool: "CONVEX_LLAMA_THENA_POOL",
    pid: 401,
    underlying: "llamathena",
    lpToken: "cvxllamathena",
  },

  stkcvxRLUSDUSDC: {
    name: "Convex stkcvxRLUSDUSDC",
    symbol: "stkcvxRLUSDUSDC",
    type: {
      AllNetworks: TokenType.CONVEX_STAKED_TOKEN,
    },
    pool: "CONVEX_RLUSD_USDC_POOL",
    pid: 443,
    underlying: "RLUSDUSDC",
    lpToken: "cvxRLUSDUSDC",
  },
};

export const convexL2StakedTokens: Record<
  ConvexL2StakedToken,
  ConvexL2StakedTokenData
> = {
  cvxcrvUSDT: {
    name: "Convex crvUSDT vault (Arbitrum)",
    symbol: "cvxcrvUSDT",
    type: {
      AllNetworks: TokenType.CONVEX_L2_STAKED_TOKEN,
    },
    pool: "CONVEX_CRVUSD_USDT_POOL_ARB",
    pid: 18,
    underlying: "crvUSDT",
  },
};

export const convexTokens: Record<
  ConvexLPToken | ConvexStakedPhantomToken | ConvexL2StakedToken,
  ConvexLPTokenData | ConvexPhantomTokenData | ConvexL2StakedTokenData
> = {
  ...convexLpTokens,
  ...convexStakedPhantomTokens,
  ...convexL2StakedTokens,
};

export const isConvexToken = (
  t: unknown,
): t is ConvexLPToken | ConvexStakedPhantomToken | ConvexL2StakedToken =>
  typeof t === "string" &&
  !!convexTokens[
    t as ConvexLPToken | ConvexStakedPhantomToken | ConvexL2StakedToken
  ];

export const isConvexLPToken = (t: unknown): t is ConvexLPToken =>
  typeof t === "string" && !!convexLpTokens[t as ConvexLPToken];

export const isConvexStakedPhantomToken = (
  t: unknown,
): t is ConvexStakedPhantomToken =>
  typeof t === "string" &&
  !!convexStakedPhantomTokens[t as ConvexStakedPhantomToken];

export const isConvexL2StakedToken = (t: unknown): t is ConvexL2StakedToken =>
  typeof t === "string" && !!convexL2StakedTokens[t as ConvexL2StakedToken];

export const convexPoolByPid = Object.values(convexLpTokens).reduce<
  Record<number, SupportedContract>
>((acc, value) => {
  acc[value.pid] = value.pool;
  return acc;
}, {});

export const convexLpTokenByPid = Object.entries(convexLpTokens).reduce<
  Record<number, SupportedToken>
>((acc, [token, data]) => {
  acc[data.pid] = token as SupportedToken;
  return acc;
}, {});
