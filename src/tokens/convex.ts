import type {
  ConvexPoolContract,
  SupportedContract,
} from "../contracts/contracts";
import { TradeAction, TradeType } from "../pathfinder/tradeTypes";
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
  lpActions: Array<TradeAction>;
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
    lpActions: [
      {
        type: TradeType.ConvexWithdrawLP,
        contract: "CONVEX_BOOSTER",
        tokenOut: "3Crv",
      },
      {
        type: TradeType.ConvexStake,
        contract: "CONVEX_3CRV_POOL",
        tokenOut: "stkcvx3Crv",
      },
    ],
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
    lpActions: [
      {
        type: TradeType.ConvexWithdrawLP,
        contract: "CONVEX_BOOSTER",
        tokenOut: "steCRV",
      },
      {
        type: TradeType.ConvexStake,
        contract: "CONVEX_STECRV_POOL",
        tokenOut: "stkcvxsteCRV",
      },
    ],
  },

  cvxFRAX3CRV: {
    name: "Convex cvxFRAX3CRV-f",

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
        tokenOut: "FRAX3CRV",
      },
      {
        type: TradeType.ConvexStake,
        contract: "CONVEX_FRAX3CRV_POOL",
        tokenOut: "stkcvxFRAX3CRV",
      },
    ],
  },

  cvxLUSD3CRV: {
    name: "Convex cvxLUSD3CRV-f",

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
        tokenOut: "LUSD3CRV",
      },
      {
        type: TradeType.ConvexStake,
        contract: "CONVEX_LUSD3CRV_POOL",
        tokenOut: "stkcvxLUSD3CRV",
      },
    ],
  },

  cvxcrvPlain3andSUSD: {
    name: "Convex cvxcrvPlain3andSUSD",

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
        tokenOut: "crvPlain3andSUSD",
      },
      {
        type: TradeType.ConvexStake,
        contract: "CONVEX_SUSD_POOL",
        tokenOut: "stkcvxcrvPlain3andSUSD",
      },
    ],
  },

  cvxgusd3CRV: {
    name: "Convex cvxgusd3CRV",

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
        tokenOut: "gusd3CRV",
      },
      {
        type: TradeType.ConvexStake,
        contract: "CONVEX_GUSD_POOL",
        tokenOut: "stkcvxgusd3CRV",
      },
    ],
  },

  cvxOHMFRAXBP: {
    name: "Convex cvxOHMFRAXBP",

    symbol: "cvxOHMFRAXBP",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_OHMFRAXBP_POOL",
    pid: 138,
    underlying: "OHMFRAXBP",
    stakedToken: "stkcvxOHMFRAXBP",
    lpActions: [
      {
        type: TradeType.ConvexWithdrawLP,
        contract: "CONVEX_BOOSTER",
        tokenOut: "OHMFRAXBP",
      },
      {
        type: TradeType.ConvexStake,
        contract: "CONVEX_OHMFRAXBP_POOL",
        tokenOut: "stkcvxOHMFRAXBP",
      },
    ],
  },

  cvxMIM_3LP3CRV: {
    name: "Convex cvxMIM-3LP3CRV-f",

    symbol: "cvxMIM_3LP3CRV",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_MIM3CRV_POOL",
    pid: 40,
    underlying: "MIM_3LP3CRV",
    stakedToken: "stkcvxMIM_3LP3CRV",
    lpActions: [
      {
        type: TradeType.ConvexWithdrawLP,
        contract: "CONVEX_BOOSTER",
        tokenOut: "MIM_3LP3CRV",
      },
      {
        type: TradeType.ConvexStake,
        contract: "CONVEX_MIM3CRV_POOL",
        tokenOut: "stkcvxMIM_3LP3CRV",
      },
    ],
  },

  cvxcrvCRVETH: {
    name: "Convex cvxcrvCRVETH",

    symbol: "cvxcrvCRVETH",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_CRVETH_POOL",
    pid: 61,
    underlying: "crvCRVETH",
    stakedToken: "stkcvxcrvCRVETH",
    lpActions: [
      {
        type: TradeType.ConvexWithdrawLP,
        contract: "CONVEX_BOOSTER",
        tokenOut: "crvCRVETH",
      },
      {
        type: TradeType.ConvexStake,
        contract: "CONVEX_OHMFRAXBP_POOL",
        tokenOut: "stkcvxcrvCRVETH",
      },
    ],
  },

  cvxcrvCVXETH: {
    name: "Convex cvxcrvCVXETH",

    symbol: "cvxcrvCVXETH",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_CVXETH_POOL",
    pid: 64,
    underlying: "crvCVXETH",
    stakedToken: "stkcvxcrvCVXETH",
    lpActions: [
      {
        type: TradeType.ConvexWithdrawLP,
        contract: "CONVEX_BOOSTER",
        tokenOut: "crvCVXETH",
      },
      {
        type: TradeType.ConvexStake,
        contract: "CONVEX_CVXETH_POOL",
        tokenOut: "stkcvxcrvCVXETH",
      },
    ],
  },

  cvxcrvUSDTWBTCWETH: {
    name: "Convex cvxcrvUSDTWBTCWETH",

    symbol: "cvxcrvUSDTWBTCWETH",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_3CRYPTO_POOL",
    pid: 188,
    underlying: "crvUSDTWBTCWETH",
    stakedToken: "stkcvxcrvUSDTWBTCWETH",
    lpActions: [
      {
        type: TradeType.ConvexWithdrawLP,
        contract: "CONVEX_BOOSTER",
        tokenOut: "crvUSDTWBTCWETH",
      },
      {
        type: TradeType.ConvexStake,
        contract: "CONVEX_3CRYPTO_POOL",
        tokenOut: "stkcvxcrvUSDTWBTCWETH",
      },
    ],
  },

  cvxLDOETH: {
    name: "Convex cvxLDOETH",

    symbol: "cvxLDOETH",
    type: TokenType.CONVEX_LP_TOKEN,
    pool: "CONVEX_LDOETH_POOL",
    pid: 149,
    underlying: "LDOETH",
    stakedToken: "stkcvxLDOETH",
    lpActions: [
      {
        type: TradeType.ConvexWithdrawLP,
        contract: "CONVEX_BOOSTER",
        tokenOut: "LDOETH",
      },
      {
        type: TradeType.ConvexStake,
        contract: "CONVEX_3CRYPTO_POOL",
        tokenOut: "stkcvxLDOETH",
      },
    ],
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
    lpActions: [
      {
        type: TradeType.ConvexWithdraw,
        contract: "CONVEX_3CRV_POOL",
        tokenOut: "cvx3Crv",
      },
      {
        type: TradeType.ConvexWithdrawAndUnwrap,
        contract: "CONVEX_3CRV_POOL",
        tokenOut: "3Crv",
      },
    ],
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
    lpActions: [
      {
        type: TradeType.ConvexWithdraw,
        contract: "CONVEX_STECRV_POOL",
        tokenOut: "cvxsteCRV",
      },
      {
        type: TradeType.ConvexWithdrawAndUnwrap,
        contract: "CONVEX_STECRV_POOL",
        tokenOut: "steCRV",
      },
    ],
  },

  stkcvxFRAX3CRV: {
    name: "Convex stkcvxFRAX3CRV-f",

    symbol: "stkcvxFRAX3CRV",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_FRAX3CRV_POOL",
    pid: 32,
    underlying: "FRAX3CRV",
    lpToken: "cvxFRAX3CRV",
    lpActions: [
      {
        type: TradeType.ConvexWithdraw,
        contract: "CONVEX_FRAX3CRV_POOL",
        tokenOut: "cvxFRAX3CRV",
      },
      {
        type: TradeType.ConvexWithdrawAndUnwrap,
        contract: "CONVEX_FRAX3CRV_POOL",
        tokenOut: "FRAX3CRV",
      },
    ],
  },

  stkcvxLUSD3CRV: {
    name: "Convex stkcvxLUSD3CRV-f",

    symbol: "stkcvxLUSD3CRV",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_LUSD3CRV_POOL",
    pid: 33,
    underlying: "LUSD3CRV",
    lpToken: "cvxLUSD3CRV",
    lpActions: [
      {
        type: TradeType.ConvexWithdraw,
        contract: "CONVEX_LUSD3CRV_POOL",
        tokenOut: "cvxLUSD3CRV",
      },
      {
        type: TradeType.ConvexWithdrawAndUnwrap,
        contract: "CONVEX_LUSD3CRV_POOL",
        tokenOut: "LUSD3CRV",
      },
    ],
  },

  stkcvxcrvPlain3andSUSD: {
    name: "Convex stkcvxcrvPlain3andSUSD",

    symbol: "stkcvxcrvPlain3andSUSD",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_SUSD_POOL",
    pid: 4,
    underlying: "crvPlain3andSUSD",
    lpToken: "cvxcrvPlain3andSUSD",
    lpActions: [
      {
        type: TradeType.ConvexWithdraw,
        contract: "CONVEX_SUSD_POOL",
        tokenOut: "cvxcrvPlain3andSUSD",
      },
      {
        type: TradeType.ConvexWithdrawAndUnwrap,
        contract: "CONVEX_SUSD_POOL",
        tokenOut: "crvPlain3andSUSD",
      },
    ],
  },

  stkcvxgusd3CRV: {
    name: "Convex stkcvxgusd3CRV",

    symbol: "stkcvxgusd3CRV",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_GUSD_POOL",
    pid: 10,
    underlying: "gusd3CRV",
    lpToken: "cvxgusd3CRV",
    lpActions: [
      {
        type: TradeType.ConvexWithdraw,
        contract: "CONVEX_GUSD_POOL",
        tokenOut: "cvxgusd3CRV",
      },
      {
        type: TradeType.ConvexWithdrawAndUnwrap,
        contract: "CONVEX_GUSD_POOL",
        tokenOut: "gusd3CRV",
      },
    ],
  },

  stkcvxOHMFRAXBP: {
    name: "Convex stkcvxOHMFRAXBP",

    symbol: "stkcvxOHMFRAXBP",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_OHMFRAXBP_POOL",
    pid: 138,
    underlying: "OHMFRAXBP",
    lpToken: "cvxOHMFRAXBP",
    lpActions: [
      {
        type: TradeType.ConvexWithdraw,
        contract: "CONVEX_OHMFRAXBP_POOL",
        tokenOut: "cvxOHMFRAXBP",
      },
      {
        type: TradeType.ConvexWithdrawAndUnwrap,
        contract: "CONVEX_OHMFRAXBP_POOL",
        tokenOut: "OHMFRAXBP",
      },
    ],
  },

  stkcvxMIM_3LP3CRV: {
    name: "Convex stkcvxMIM_3LP3CRV-f",

    symbol: "stkcvxMIM_3LP3CRV",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_MIM3CRV_POOL",
    pid: 40,
    underlying: "MIM_3LP3CRV",
    lpToken: "cvxMIM_3LP3CRV",
    lpActions: [
      {
        type: TradeType.ConvexWithdraw,
        contract: "CONVEX_MIM3CRV_POOL",
        tokenOut: "cvxMIM_3LP3CRV",
      },
      {
        type: TradeType.ConvexWithdrawAndUnwrap,
        contract: "CONVEX_MIM3CRV_POOL",
        tokenOut: "MIM_3LP3CRV",
      },
    ],
  },

  stkcvxcrvCRVETH: {
    name: "Convex stkcvxcrvCRVETH",

    symbol: "stkcvxcrvCRVETH",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_CRVETH_POOL",
    pid: 61,
    underlying: "crvCRVETH",
    lpToken: "cvxcrvCRVETH",
    lpActions: [
      {
        type: TradeType.ConvexWithdraw,
        contract: "CONVEX_CRVETH_POOL",
        tokenOut: "cvxcrvCRVETH",
      },
      {
        type: TradeType.ConvexWithdrawAndUnwrap,
        contract: "CONVEX_CRVETH_POOL",
        tokenOut: "crvCRVETH",
      },
    ],
  },

  stkcvxcrvCVXETH: {
    name: "Convex stkcvxcrvCVXETH",

    symbol: "stkcvxcrvCVXETH",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_CVXETH_POOL",
    pid: 64,
    underlying: "crvCVXETH",
    lpToken: "cvxcrvCVXETH",
    lpActions: [
      {
        type: TradeType.ConvexWithdraw,
        contract: "CONVEX_CVXETH_POOL",
        tokenOut: "cvxcrvCVXETH",
      },
      {
        type: TradeType.ConvexWithdrawAndUnwrap,
        contract: "CONVEX_CVXETH_POOL",
        tokenOut: "crvCVXETH",
      },
    ],
  },

  stkcvxcrvUSDTWBTCWETH: {
    name: "Convex stkcvxcrv3crypto",

    symbol: "stkcvxcrvUSDTWBTCWETH",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_3CRYPTO_POOL",
    pid: 188,
    underlying: "crvUSDTWBTCWETH",
    lpToken: "cvxcrvUSDTWBTCWETH",
    lpActions: [
      {
        type: TradeType.ConvexWithdraw,
        contract: "CONVEX_3CRYPTO_POOL",
        tokenOut: "cvxcrvUSDTWBTCWETH",
      },
      {
        type: TradeType.ConvexWithdrawAndUnwrap,
        contract: "CONVEX_3CRYPTO_POOL",
        tokenOut: "crvUSDTWBTCWETH",
      },
    ],
  },

  stkcvxLDOETH: {
    name: "Convex stkcvxLDOETH",

    symbol: "stkcvxLDOETH",
    type: TokenType.CONVEX_STAKED_TOKEN,
    pool: "CONVEX_LDOETH_POOL",
    pid: 149,
    underlying: "LDOETH",
    lpToken: "cvxLDOETH",
    lpActions: [
      {
        type: TradeType.ConvexWithdraw,
        contract: "CONVEX_3CRYPTO_POOL",
        tokenOut: "cvxLDOETH",
      },
      {
        type: TradeType.ConvexWithdrawAndUnwrap,
        contract: "CONVEX_3CRYPTO_POOL",
        tokenOut: "LDOETH",
      },
    ],
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
