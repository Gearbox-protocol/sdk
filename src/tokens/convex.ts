import { TradeAction, TradeType } from "../pathfinder/tradeTypes";
import type { TokenBase } from "./token";
import type { ConvexPoolContract } from "../contracts/contracts";
import type { CurveLPToken } from "./curveLP";
import { TokenType } from "./tokenType";

export type ConvexLPToken =
  | "cvx3Crv"
  | "cvxsteCRV"
  | "cvxFRAX3CRV"
  | "cvxLUSD3CRV"
  | "cvxcrvPlain3andSUSD"
  | "cvxgusd3CRV";

export type ConvexStakedPhantomToken =
  | "stkcvx3Crv"
  | "stkcvxsteCRV"
  | "stkcvxFRAX3CRV"
  | "stkcvxLUSD3CRV"
  | "stkcvxcrvPlain3andSUSD"
  | "stkcvxgusd3CRV";

type BaseConvexToken = {
  pool: ConvexPoolContract;
  pid: number;
  underlying: CurveLPToken;
  lpActions: Array<TradeAction>;
} & TokenBase;

export type ConvexLPTokenData = {
  symbol: ConvexLPToken;
  type: TokenType.CONVEX_LP_TOKEN;
  stakedToken: ConvexStakedPhantomToken;
} & BaseConvexToken;

export type ConvexPhantomTokenData = {
  symbol: ConvexStakedPhantomToken;
  type: TokenType.CONVEX_STAKED_PHANTOM_TOKEN;
  lpToken: ConvexLPToken;
} & BaseConvexToken;

export const convexTokens: Record<
  ConvexLPToken | ConvexStakedPhantomToken,
  ConvexLPTokenData | ConvexPhantomTokenData
> = {
  // CONVEX LP TOKENS
  cvx3Crv: {
    name: "cvx3Crv",
    decimals: 18,

    symbol: "cvx3Crv",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_3CRV_POOL",
    pid: 9,
    underlying: "3Crv",
    stakedToken: "stkcvx3Crv",
    lpActions: [
      {
        type: TradeType.ConvexWithdrawLP,
        contract: "CONVEX_BOOSTER",
        tokenOut: "3Crv"
      },
      {
        type: TradeType.ConvexStake,
        contract: "CONVEX_3CRV_POOL",
        tokenOut: "stkcvx3Crv"
      }
    ]
  },

  cvxsteCRV: {
    name: "cvxsteCRV",
    decimals: 18,

    symbol: "cvxsteCRV",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_STECRV_POOL",
    pid: 25,
    underlying: "steCRV",
    stakedToken: "stkcvxsteCRV",
    lpActions: [
      {
        type: TradeType.ConvexWithdrawLP,
        contract: "CONVEX_BOOSTER",
        tokenOut: "steCRV"
      },
      {
        type: TradeType.ConvexStake,
        contract: "CONVEX_STECRV_POOL",
        tokenOut: "stkcvxsteCRV"
      }
    ]
  },

  cvxFRAX3CRV: {
    name: "cvxFRAX3CRV-f",
    decimals: 18,

    symbol: "cvxFRAX3CRV",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_FRAX3CRV_POOL",
    pid: 32,
    underlying: "FRAX3CRV",
    stakedToken: "stkcvxFRAX3CRV",
    lpActions: [
      {
        type: TradeType.ConvexWithdrawLP,
        contract: "CONVEX_BOOSTER",
        tokenOut: "FRAX3CRV"
      },
      {
        type: TradeType.ConvexStake,
        contract: "CONVEX_FRAX3CRV_POOL",
        tokenOut: "stkcvxFRAX3CRV"
      }
    ]
  },

  cvxLUSD3CRV: {
    name: "cvxLUSD3CRV-f",
    decimals: 18,

    symbol: "cvxLUSD3CRV",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_LUSD3CRV_POOL",
    pid: 33,
    underlying: "LUSD3CRV",
    stakedToken: "stkcvxLUSD3CRV",
    lpActions: [
      {
        type: TradeType.ConvexWithdrawLP,
        contract: "CONVEX_BOOSTER",
        tokenOut: "LUSD3CRV"
      },
      {
        type: TradeType.ConvexStake,
        contract: "CONVEX_LUSD3CRV_POOL",
        tokenOut: "stkcvxLUSD3CRV"
      }
    ]
  },

  cvxcrvPlain3andSUSD: {
    name: "cvxcrvPlain3andSUSD",
    decimals: 18,

    symbol: "cvxcrvPlain3andSUSD",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_SUSD_POOL",
    pid: 4,
    underlying: "crvPlain3andSUSD",
    stakedToken: "stkcvxcrvPlain3andSUSD",
    lpActions: [
      {
        type: TradeType.ConvexWithdrawLP,
        contract: "CONVEX_BOOSTER",
        tokenOut: "crvPlain3andSUSD"
      },
      {
        type: TradeType.ConvexStake,
        contract: "CONVEX_SUSD_POOL",
        tokenOut: "stkcvxcrvPlain3andSUSD"
      }
    ]
  },

  cvxgusd3CRV: {
    name: "cvxgusd3CRV",
    decimals: 18,

    symbol: "cvxgusd3CRV",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_GUSD_POOL",
    pid: 10,
    underlying: "gusd3CRV",
    stakedToken: "stkcvxgusd3CRV",
    lpActions: [
      {
        type: TradeType.ConvexWithdrawLP,
        contract: "CONVEX_BOOSTER",
        tokenOut: "gusd3CRV"
      },
      {
        type: TradeType.ConvexStake,
        contract: "CONVEX_GUSD_POOL",
        tokenOut: "stkcvxgusd3CRV"
      }
    ]
  },

  // STAKED CONVEX
  stkcvx3Crv: {
    name: "stkcvx3Crv",
    decimals: 18,

    symbol: "stkcvx3Crv",
    type: TokenType.CONVEX_STAKED_PHANTOM_TOKEN,
    pool: "CONVEX_3CRV_POOL",
    pid: 9,
    underlying: "3Crv",
    lpToken: "cvx3Crv",
    lpActions: [
      {
        type: TradeType.ConvexWithdraw,
        contract: "CONVEX_3CRV_POOL",
        tokenOut: "cvx3Crv"
      },
      {
        type: TradeType.ConvexWithdrawAndUnwrap,
        contract: "CONVEX_3CRV_POOL",
        tokenOut: "3Crv"
      }
    ]
  },

  stkcvxsteCRV: {
    name: "stkcvxsteCRV",
    decimals: 18,

    symbol: "stkcvxsteCRV",
    type: TokenType.CONVEX_STAKED_PHANTOM_TOKEN,
    pool: "CONVEX_STECRV_POOL",
    pid: 25,
    underlying: "steCRV",
    lpToken: "cvxsteCRV",
    lpActions: [
      {
        type: TradeType.ConvexWithdraw,
        contract: "CONVEX_STECRV_POOL",
        tokenOut: "cvxsteCRV"
      },
      {
        type: TradeType.ConvexWithdrawAndUnwrap,
        contract: "CONVEX_STECRV_POOL",
        tokenOut: "steCRV"
      }
    ]
  },

  stkcvxFRAX3CRV: {
    name: "stkcvxFRAX3CRV-f",
    decimals: 18,

    symbol: "stkcvxFRAX3CRV",
    type: TokenType.CONVEX_STAKED_PHANTOM_TOKEN,
    pool: "CONVEX_FRAX3CRV_POOL",
    pid: 32,
    underlying: "FRAX3CRV",
    lpToken: "cvxFRAX3CRV",
    lpActions: [
      {
        type: TradeType.ConvexWithdraw,
        contract: "CONVEX_FRAX3CRV_POOL",
        tokenOut: "cvxFRAX3CRV"
      },
      {
        type: TradeType.ConvexWithdrawAndUnwrap,
        contract: "CONVEX_FRAX3CRV_POOL",
        tokenOut: "FRAX3CRV"
      }
    ]
  },

  stkcvxLUSD3CRV: {
    name: "stkcvxLUSD3CRV-f",
    decimals: 18,

    symbol: "stkcvxLUSD3CRV",
    type: TokenType.CONVEX_STAKED_PHANTOM_TOKEN,
    pool: "CONVEX_LUSD3CRV_POOL",
    pid: 32,
    underlying: "LUSD3CRV",
    lpToken: "cvxLUSD3CRV",
    lpActions: [
      {
        type: TradeType.ConvexWithdraw,
        contract: "CONVEX_LUSD3CRV_POOL",
        tokenOut: "cvxLUSD3CRV"
      },
      {
        type: TradeType.ConvexWithdrawAndUnwrap,
        contract: "CONVEX_LUSD3CRV_POOL",
        tokenOut: "LUSD3CRV"
      }
    ]
  },

  stkcvxcrvPlain3andSUSD: {
    name: "stkcvxcrvPlain3andSUSD",
    decimals: 18,

    symbol: "stkcvxcrvPlain3andSUSD",
    type: TokenType.CONVEX_STAKED_PHANTOM_TOKEN,
    pool: "CONVEX_SUSD_POOL",
    pid: 4,
    underlying: "crvPlain3andSUSD",
    lpToken: "cvxcrvPlain3andSUSD",
    lpActions: [
      {
        type: TradeType.ConvexWithdraw,
        contract: "CONVEX_SUSD_POOL",
        tokenOut: "cvxcrvPlain3andSUSD"
      },
      {
        type: TradeType.ConvexWithdrawAndUnwrap,
        contract: "CONVEX_SUSD_POOL",
        tokenOut: "crvPlain3andSUSD"
      }
    ]
  },

  stkcvxgusd3CRV: {
    name: "stkcvxgusd3CRV",
    decimals: 18,

    symbol: "stkcvxgusd3CRV",
    type: TokenType.CONVEX_STAKED_PHANTOM_TOKEN,
    pool: "CONVEX_GUSD_POOL",
    pid: 10,
    underlying: "gusd3CRV",
    lpToken: "cvxgusd3CRV",
    lpActions: [
      {
        type: TradeType.ConvexWithdraw,
        contract: "CONVEX_GUSD_POOL",
        tokenOut: "cvxgusd3CRV"
      },
      {
        type: TradeType.ConvexWithdrawAndUnwrap,
        contract: "CONVEX_GUSD_POOL",
        tokenOut: "gusd3CRV"
      }
    ]
  }
};
