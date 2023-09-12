import type {
  ConvexPoolContract,
  SupportedContract,
} from "../contracts/contracts";
import type { CurveLPToken } from "./curveLP";
import type { SupportedToken, TokenBase } from "./token";
import { TokenType } from "./tokenType";

export type ConvexLPToken =
  | "cvx3Crv"
  | "cvxcrvFRAX"
  | "cvxsteCRV"
  | "cvxFRAX3CRV"
  | "cvxLUSD3CRV"
  | "cvxcrvPlain3andSUSD"
  | "cvxgusd3CRV"
  | "cvxOHMFRAXBP"
  | "cvxMIM_3LP3CRV"
  | "cvxcrvCRVETH"
  | "cvxcrvCVXETH"
  | "cvxcrvUSDTWBTCWETH"
  | "cvxLDOETH";

export type ConvexStakedPhantomToken =
  | "stkcvx3Crv"
  | "stkcvxcrvFRAX"
  | "stkcvxsteCRV"
  | "stkcvxFRAX3CRV"
  | "stkcvxLUSD3CRV"
  | "stkcvxcrvPlain3andSUSD"
  | "stkcvxgusd3CRV"
  | "stkcvxOHMFRAXBP"
  | "stkcvxMIM_3LP3CRV"
  | "stkcvxcrvCRVETH"
  | "stkcvxcrvCVXETH"
  | "stkcvxcrvUSDTWBTCWETH"
  | "stkcvxLDOETH";

type BaseConvexToken = {
  pool: ConvexPoolContract;
  pid: number;
  underlying: CurveLPToken;
} & TokenBase;

export type ConvexLPTokenData = {
  symbol: ConvexLPToken;
  type: TokenType.CONVEX_LP_TOKEN;
  stakedToken: ConvexStakedPhantomToken;
} & BaseConvexToken;

export type ConvexPhantomTokenData = {
  symbol: ConvexStakedPhantomToken;
  type: TokenType.CONVEX_STAKED_TOKEN;
  lpToken: ConvexLPToken;
} & BaseConvexToken;

export const convexLpTokens: Record<ConvexLPToken, ConvexLPTokenData> = {
  cvx3Crv: {
    name: "Convex cvx3Crv",

    symbol: "cvx3Crv",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_3CRV_POOL",
    pid: 9,
    underlying: "3Crv",
    stakedToken: "stkcvx3Crv",
  },

  cvxcrvFRAX: {
    name: "Convex cvxcrvFRAX",

    symbol: "cvxcrvFRAX",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_FRAX_USDC_POOL",
    pid: 100,
    underlying: "crvFRAX",
    stakedToken: "stkcvxcrvFRAX",
  },

  cvxsteCRV: {
    name: "Convex cvxsteCRV",

    symbol: "cvxsteCRV",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_STECRV_POOL",
    pid: 25,
    underlying: "steCRV",
    stakedToken: "stkcvxsteCRV",
  },

  cvxFRAX3CRV: {
    name: "Convex cvxFRAX3CRV-f",

    symbol: "cvxFRAX3CRV",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_FRAX3CRV_POOL",
    pid: 32,
    underlying: "FRAX3CRV",
    stakedToken: "stkcvxFRAX3CRV",
  },

  cvxLUSD3CRV: {
    name: "Convex cvxLUSD3CRV-f",

    symbol: "cvxLUSD3CRV",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_LUSD3CRV_POOL",
    pid: 33,
    underlying: "LUSD3CRV",
    stakedToken: "stkcvxLUSD3CRV",
  },

  cvxcrvPlain3andSUSD: {
    name: "Convex cvxcrvPlain3andSUSD",

    symbol: "cvxcrvPlain3andSUSD",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_SUSD_POOL",
    pid: 4,
    underlying: "crvPlain3andSUSD",
    stakedToken: "stkcvxcrvPlain3andSUSD",
  },

  cvxgusd3CRV: {
    name: "Convex cvxgusd3CRV",

    symbol: "cvxgusd3CRV",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_GUSD_POOL",
    pid: 10,
    underlying: "gusd3CRV",
    stakedToken: "stkcvxgusd3CRV",
  },

  cvxOHMFRAXBP: {
    name: "Convex cvxOHMFRAXBP",

    symbol: "cvxOHMFRAXBP",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_OHMFRAXBP_POOL",
    pid: 138,
    underlying: "OHMFRAXBP",
    stakedToken: "stkcvxOHMFRAXBP",
  },

  cvxMIM_3LP3CRV: {
    name: "Convex cvxMIM-3LP3CRV-f",

    symbol: "cvxMIM_3LP3CRV",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_MIM3CRV_POOL",
    pid: 40,
    underlying: "MIM_3LP3CRV",
    stakedToken: "stkcvxMIM_3LP3CRV",
  },

  cvxcrvCRVETH: {
    name: "Convex cvxcrvCRVETH",

    symbol: "cvxcrvCRVETH",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_CRVETH_POOL",
    pid: 61,
    underlying: "crvCRVETH",
    stakedToken: "stkcvxcrvCRVETH",
  },

  cvxcrvCVXETH: {
    name: "Convex cvxcrvCVXETH",

    symbol: "cvxcrvCVXETH",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_CVXETH_POOL",
    pid: 64,
    underlying: "crvCVXETH",
    stakedToken: "stkcvxcrvCVXETH",
  },

  cvxcrvUSDTWBTCWETH: {
    name: "Convex cvxcrvUSDTWBTCWETH",

    symbol: "cvxcrvUSDTWBTCWETH",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_3CRYPTO_POOL",
    pid: 188,
    underlying: "crvUSDTWBTCWETH",
    stakedToken: "stkcvxcrvUSDTWBTCWETH",
  },

  cvxLDOETH: {
    name: "Convex cvxLDOETH",

    symbol: "cvxLDOETH",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_LDOETH_POOL",
    pid: 149,
    underlying: "LDOETH",
    stakedToken: "stkcvxLDOETH",
  },
};

export const convexStakedPhantomTokens: Record<
  ConvexStakedPhantomToken,
  ConvexPhantomTokenData
> = {
  stkcvx3Crv: {
    name: "Convex stkcvx3Crv",
    symbol: "stkcvx3Crv",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_3CRV_POOL",
    pid: 9,
    underlying: "3Crv",
    lpToken: "cvx3Crv",
  },

  stkcvxcrvFRAX: {
    name: "Convex stkcvxcrvFRAX",
    symbol: "stkcvxcrvFRAX",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_FRAX_USDC_POOL",
    pid: 100,
    underlying: "crvFRAX",
    lpToken: "cvxcrvFRAX",
  },

  stkcvxsteCRV: {
    name: "Convex stkcvxsteCRV",

    symbol: "stkcvxsteCRV",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_STECRV_POOL",
    pid: 25,
    underlying: "steCRV",
    lpToken: "cvxsteCRV",
  },

  stkcvxFRAX3CRV: {
    name: "Convex stkcvxFRAX3CRV-f",

    symbol: "stkcvxFRAX3CRV",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_FRAX3CRV_POOL",
    pid: 32,
    underlying: "FRAX3CRV",
    lpToken: "cvxFRAX3CRV",
  },

  stkcvxLUSD3CRV: {
    name: "Convex stkcvxLUSD3CRV-f",

    symbol: "stkcvxLUSD3CRV",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_LUSD3CRV_POOL",
    pid: 33,
    underlying: "LUSD3CRV",
    lpToken: "cvxLUSD3CRV",
  },

  stkcvxcrvPlain3andSUSD: {
    name: "Convex stkcvxcrvPlain3andSUSD",

    symbol: "stkcvxcrvPlain3andSUSD",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_SUSD_POOL",
    pid: 4,
    underlying: "crvPlain3andSUSD",
    lpToken: "cvxcrvPlain3andSUSD",
  },

  stkcvxgusd3CRV: {
    name: "Convex stkcvxgusd3CRV",

    symbol: "stkcvxgusd3CRV",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_GUSD_POOL",
    pid: 10,
    underlying: "gusd3CRV",
    lpToken: "cvxgusd3CRV",
  },

  stkcvxOHMFRAXBP: {
    name: "Convex stkcvxOHMFRAXBP",

    symbol: "stkcvxOHMFRAXBP",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_OHMFRAXBP_POOL",
    pid: 138,
    underlying: "OHMFRAXBP",
    lpToken: "cvxOHMFRAXBP",
  },

  stkcvxMIM_3LP3CRV: {
    name: "Convex stkcvxMIM_3LP3CRV-f",

    symbol: "stkcvxMIM_3LP3CRV",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_MIM3CRV_POOL",
    pid: 40,
    underlying: "MIM_3LP3CRV",
    lpToken: "cvxMIM_3LP3CRV",
  },

  stkcvxcrvCRVETH: {
    name: "Convex stkcvxcrvCRVETH",

    symbol: "stkcvxcrvCRVETH",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_CRVETH_POOL",
    pid: 61,
    underlying: "crvCRVETH",
    lpToken: "cvxcrvCRVETH",
  },

  stkcvxcrvCVXETH: {
    name: "Convex stkcvxcrvCVXETH",

    symbol: "stkcvxcrvCVXETH",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_CVXETH_POOL",
    pid: 64,
    underlying: "crvCVXETH",
    lpToken: "cvxcrvCVXETH",
  },

  stkcvxcrvUSDTWBTCWETH: {
    name: "Convex stkcvxcrv3crypto",

    symbol: "stkcvxcrvUSDTWBTCWETH",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_3CRYPTO_POOL",
    pid: 188,
    underlying: "crvUSDTWBTCWETH",
    lpToken: "cvxcrvUSDTWBTCWETH",
  },

  stkcvxLDOETH: {
    name: "Convex stkcvxLDOETH",

    symbol: "stkcvxLDOETH",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_LDOETH_POOL",
    pid: 149,
    underlying: "LDOETH",
    lpToken: "cvxLDOETH",
  },
};

export const convexTokens: Record<
  ConvexLPToken | ConvexStakedPhantomToken,
  ConvexLPTokenData | ConvexPhantomTokenData
> = {
  ...convexLpTokens,
  ...convexStakedPhantomTokens,
};

export const isConvexToken = (
  t: unknown,
): t is ConvexLPToken | ConvexStakedPhantomToken =>
  typeof t === "string" &&
  !!convexTokens[t as ConvexLPToken | ConvexStakedPhantomToken];

export const isConvexLPToken = (t: unknown): t is ConvexLPToken =>
  typeof t === "string" && !!convexLpTokens[t as ConvexLPToken];

export const isConvexStakedPhantomToken = (
  t: unknown,
): t is ConvexStakedPhantomToken =>
  typeof t === "string" &&
  !!convexStakedPhantomTokens[t as ConvexStakedPhantomToken];

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
