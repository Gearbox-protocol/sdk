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
  | "cvxgusd3CRV";

export type ConvexStakedPhantomToken =
  | "stkcvx3Crv"
  | "stkcvxcrvFRAX"
  | "stkcvxsteCRV"
  | "stkcvxFRAX3CRV"
  | "stkcvxLUSD3CRV"
  | "stkcvxcrvPlain3andSUSD"
  | "stkcvxgusd3CRV";

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

const convexLpTokens: Record<ConvexLPToken, ConvexLPTokenData> = {
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
    lpActions: [
      {
        type: TradeType.ConvexWithdrawLP,
        contract: "CONVEX_BOOSTER",
        tokenOut: "crvFRAX",
      },
      {
        type: TradeType.ConvexStake,
        contract: "CONVEX_3CRV_POOL",
        tokenOut: "stkcvxcrvFRAX",
      },
    ],
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
};

const convexStakedPhantomTokens: Record<
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

  stkcvxcrvFRAX: {
    name: "Convex stkcvxcrvFRAX",
    symbol: "stkcvxcrvFRAX",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_FRAX_USDC_POOL",
    pid: 100,
    underlying: "crvFRAX",
    lpToken: "cvxcrvFRAX",
    lpActions: [
      {
        type: TradeType.ConvexWithdraw,
        contract: "CONVEX_FRAX_USDC_POOL",
        tokenOut: "cvxcrvFRAX",
      },
      {
        type: TradeType.ConvexWithdrawAndUnwrap,
        contract: "CONVEX_FRAX_USDC_POOL",
        tokenOut: "crvFRAX",
      },
    ],
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
