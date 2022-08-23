import { BigNumber } from "ethers";

import type { CurvePoolContract } from "../contracts/contracts";
import { TradeAction, TradeType } from "../pathfinder/tradeTypes";
import { PartialRecord } from "../utils/types";
import type { SupportedToken, TokenBase } from "./token";
import { TokenType } from "./tokenType";

export type CurveLPToken =
  | "3Crv"
  | "steCRV"
  | "FRAX3CRV"
  | "LUSD3CRV"
  | "crvPlain3andSUSD"
  | "gusd3CRV";

export type CurveLPTokenData = {
  symbol: CurveLPToken;
  type: TokenType.CURVE_LP;
  swapActions?: Array<TradeAction>;
  lpActions: Array<TradeAction>;
  pool: CurvePoolContract;
  wrapper?: CurvePoolContract;
} & TokenBase;

export type MetaCurveLPTokenData = {
  symbol: CurveLPToken;
  type: TokenType.META_CURVE_LP;
  lpActions: Array<TradeAction>;
  pool: CurvePoolContract;
  wrapper?: CurvePoolContract;
} & TokenBase;

export const Curve3CrvUnderlyingTokenIndex: PartialRecord<
  SupportedToken,
  BigNumber
> = {
  DAI: BigNumber.from(0),
  USDC: BigNumber.from(1),
  USDT: BigNumber.from(2),
};

export const curveTokens: Record<
  CurveLPToken,
  CurveLPTokenData | MetaCurveLPTokenData
> = {
  // CURVE LP TOKENS
  "3Crv": {
    name: "Curve 3Crv",
    decimals: 18,
    symbol: "3Crv",
    type: TokenType.CURVE_LP,
    pool: "CURVE_3CRV_POOL",
    lpActions: [
      {
        type: TradeType.CurveWithdrawLP,
        contract: "CURVE_3CRV_POOL",
        tokenOut: ["DAI", "USDC", "USDT"],
      },
      {
        type: TradeType.ConvexDepositLP,
        contract: "CONVEX_BOOSTER",
        tokenOut: "cvx3Crv",
      },
      {
        type: TradeType.ConvexDepositLPAndStake,
        contract: "CONVEX_BOOSTER",
        tokenOut: "stkcvx3Crv",
      },
    ],
  },

  steCRV: {
    name: "Curve steCRV",
    decimals: 18,
    symbol: "steCRV",
    type: TokenType.CURVE_LP,
    pool: "CURVE_STETH_GATEWAY",
    lpActions: [
      {
        type: TradeType.CurveWithdrawLP,
        contract: "CURVE_STETH_GATEWAY",
        tokenOut: ["STETH", "WETH"],
      },
      {
        type: TradeType.ConvexDepositLP,
        contract: "CONVEX_BOOSTER",
        tokenOut: "cvxsteCRV",
      },
      {
        type: TradeType.ConvexDepositLPAndStake,
        contract: "CONVEX_BOOSTER",
        tokenOut: "stkcvxsteCRV",
      },
    ],
  },

  crvPlain3andSUSD: {
    name: "Curve crvPlain3andSUSD",
    decimals: 18,
    symbol: "crvPlain3andSUSD",
    type: TokenType.CURVE_LP,
    pool: "CURVE_SUSD_POOL",
    wrapper: "CURVE_SUSD_DEPOSIT",
    lpActions: [
      {
        type: TradeType.CurveWithdrawLP,
        contract: "CURVE_SUSD_POOL",
        tokenOut: ["DAI", "USDC", "USDT", "sUSD"],
      },
      {
        type: TradeType.ConvexDepositLP,
        contract: "CONVEX_BOOSTER",
        tokenOut: "cvxcrvPlain3andSUSD",
      },
      {
        type: TradeType.ConvexDepositLPAndStake,
        contract: "CONVEX_BOOSTER",
        tokenOut: "stkcvxcrvPlain3andSUSD",
      },
    ],
  },

  //  META CURVE LP TOKENS
  FRAX3CRV: {
    name: "Curve FRAX3CRV-f",
    decimals: 18,
    symbol: "FRAX3CRV",
    type: TokenType.META_CURVE_LP,
    pool: "CURVE_FRAX_POOL",
    lpActions: [
      {
        type: TradeType.CurveWithdrawLP,
        contract: "CURVE_FRAX_POOL",
        tokenOut: ["FRAX", "3Crv"],
      },
      {
        type: TradeType.ConvexDepositLP,
        contract: "CONVEX_BOOSTER",
        tokenOut: "cvxFRAX3CRV",
      },
      {
        type: TradeType.ConvexDepositLPAndStake,
        contract: "CONVEX_BOOSTER",
        tokenOut: "stkcvxFRAX3CRV",
      },
    ],
  },

  LUSD3CRV: {
    name: "Curve LUSD3CRV-f",
    decimals: 18,
    symbol: "LUSD3CRV",
    type: TokenType.META_CURVE_LP,
    pool: "CURVE_LUSD_POOL",
    lpActions: [
      {
        type: TradeType.CurveWithdrawLP,
        contract: "CURVE_LUSD_POOL",
        tokenOut: ["LUSD", "3Crv"],
      },
    ],
  },

  gusd3CRV: {
    name: "Curve gusd3CRV",
    decimals: 18,
    symbol: "gusd3CRV",
    type: TokenType.META_CURVE_LP,
    pool: "CURVE_GUSD_POOL",
    lpActions: [
      {
        type: TradeType.CurveWithdrawLP,
        contract: "CURVE_GUSD_POOL",
        tokenOut: ["GUSD", "3Crv"],
      },
      {
        type: TradeType.ConvexDepositLP,
        contract: "CONVEX_BOOSTER",
        tokenOut: "cvxgusd3CRV",
      },
      {
        type: TradeType.ConvexDepositLPAndStake,
        contract: "CONVEX_BOOSTER",
        tokenOut: "stkcvxgusd3CRV",
      },
    ],
  },
};

export const isCurveLPToken = (t: unknown): t is CurveLPToken =>
  typeof t === "string" && !!curveTokens[t as CurveLPToken];
