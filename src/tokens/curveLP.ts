import { BigNumber } from "ethers";

import type { CurvePoolContract } from "../contracts/contracts";
import { TradeAction } from "../pathfinder/tradeTypes";
import { PartialRecord } from "../utils/types";
import { NormalToken } from "./normal";
import type { SupportedToken, TokenBase } from "./token";
import { TokenType } from "./tokenType";

export type CurveMetaTokens =
  | "FRAX3CRV"
  | "LUSD3CRV"
  | "gusd3CRV"
  | "MIM_3LP3CRV"
  | "OHMFRAXBP";
export type CurveLPToken =
  | "3Crv"
  | "steCRV"
  | "crvPlain3andSUSD"
  | "crvFRAX"
  | "crvCRVETH"
  | "crvCVXETH"
  | "crvUSDTWBTCWETH"
  | "LDOETH"
  | "crvUSDUSDC"
  | "crvUSDUSDT"
  | "crvUSDFRAX"
  | "crvUSDETHCRV"
  | CurveMetaTokens;

export type CurveLPTokenData = {
  symbol: CurveLPToken;
  type: TokenType.CURVE_LP_TOKEN;
  swapActions?: Array<TradeAction>;
  tokenOut: Array<CurveLPToken | NormalToken>;
  pool: CurvePoolContract;
  wrapper?: CurvePoolContract;
} & TokenBase;

export type MetaCurveLPTokenData = {
  symbol: CurveLPToken;
  type: TokenType.CURVE_LP_TOKEN;
  tokenOut: Array<CurveLPToken | NormalToken>;
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

export const curveMetaTokens: Record<CurveMetaTokens, MetaCurveLPTokenData> = {
  //  META CURVE LP TOKENS
  FRAX3CRV: {
    name: "Curve FRAX3CRV-f",
    symbol: "FRAX3CRV",
    type: TokenType.CURVE_LP_TOKEN,
    pool: "CURVE_FRAX_POOL",
    tokenOut: ["FRAX", "3Crv"],
  },

  LUSD3CRV: {
    name: "Curve LUSD3CRV-f",
    symbol: "LUSD3CRV",
    type: TokenType.CURVE_LP_TOKEN,
    pool: "CURVE_LUSD_POOL",
    tokenOut: ["LUSD", "3Crv"],
  },

  gusd3CRV: {
    name: "Curve gusd3CRV",
    symbol: "gusd3CRV",
    type: TokenType.CURVE_LP_TOKEN,
    pool: "CURVE_GUSD_POOL",
    tokenOut: ["GUSD", "3Crv"],
  },

  MIM_3LP3CRV: {
    name: "Curve MIM_3LP3CRV",
    symbol: "MIM_3LP3CRV",
    type: TokenType.CURVE_LP_TOKEN,
    pool: "CURVE_MIM_POOL",
    tokenOut: ["MIM", "3Crv"],
  },
  OHMFRAXBP: {
    name: "Curve.fi Factory Crypto Pool: OHM/FRAXBP",
    symbol: "OHMFRAXBP",
    type: TokenType.CURVE_LP_TOKEN,
    pool: "CURVE_OHMFRAXBP_POOL",
    tokenOut: ["OHM", "FRAX", "USDC"],
  },
};

export const curveTokens: Record<
  CurveLPToken,
  CurveLPTokenData | MetaCurveLPTokenData
> = {
  // CURVE LP TOKENS
  "3Crv": {
    name: "Curve 3Crv",
    symbol: "3Crv",
    type: TokenType.CURVE_LP_TOKEN,
    pool: "CURVE_3CRV_POOL",
    tokenOut: ["DAI", "USDC", "USDT"],
  },

  crvFRAX: {
    name: "Curve.fi FRAX/USDC",
    symbol: "crvFRAX",
    type: TokenType.CURVE_LP_TOKEN,
    pool: "CURVE_FRAX_USDC_POOL",
    tokenOut: ["FRAX", "USDC"],
  },

  steCRV: {
    name: "Curve steCRV",
    symbol: "steCRV",
    type: TokenType.CURVE_LP_TOKEN,
    pool: "CURVE_STETH_GATEWAY",
    tokenOut: ["STETH", "WETH"],
  },

  crvPlain3andSUSD: {
    name: "Curve crvPlain3andSUSD",
    symbol: "crvPlain3andSUSD",
    type: TokenType.CURVE_LP_TOKEN,
    pool: "CURVE_SUSD_POOL",
    wrapper: "CURVE_SUSD_DEPOSIT",
    tokenOut: ["DAI", "USDC", "USDT", "sUSD"],
  },
  crvCRVETH: {
    name: "Curve CRV-ETH",
    symbol: "crvCRVETH",
    type: TokenType.CURVE_LP_TOKEN,
    pool: "CURVE_CRVETH_POOL",
    tokenOut: ["WETH", "CRV"],
  },
  crvCVXETH: {
    name: "Curve CVX-ETH",
    symbol: "crvCVXETH",
    type: TokenType.CURVE_LP_TOKEN,
    pool: "CURVE_CVXETH_POOL",
    tokenOut: ["WETH", "CVX"],
  },
  crvUSDTWBTCWETH: {
    name: "Curve USDT/WBTC/WETH",
    symbol: "crvUSDTWBTCWETH",
    type: TokenType.CURVE_LP_TOKEN,
    pool: "CURVE_3CRYPTO_POOL",
    tokenOut: ["USDT", "WBTC", "WETH"],
  },
  LDOETH: {
    name: "Curve LDOETH",
    symbol: "LDOETH",
    type: TokenType.CURVE_LP_TOKEN,
    pool: "CURVE_LDOETH_POOL",
    tokenOut: ["LDO", "WETH"],
  },

  crvUSDUSDC: {
    name: "Curve crvUSDUSDC",
    symbol: "crvUSDUSDC",
    type: TokenType.CURVE_LP_TOKEN,
    pool: "CURVE_CRVUSD_USDC_POOL",
    tokenOut: ["crvUSD", "USDC"],
  },
  crvUSDUSDT: {
    name: "Curve crvUSDUSDT",
    symbol: "crvUSDUSDT",
    type: TokenType.CURVE_LP_TOKEN,
    pool: "CURVE_CRVUSD_USDT_POOL",
    tokenOut: ["crvUSD", "USDT"],
  },
  crvUSDFRAX: {
    name: "Curve crvUSDFRAX",
    symbol: "crvUSDFRAX",
    type: TokenType.CURVE_LP_TOKEN,
    pool: "CURVE_CRVUSD_USDC_POOL",
    tokenOut: ["crvUSD", "FRAX"],
  },

  crvUSDETHCRV: {
    name: "Curve crvUSDETHCRV",
    symbol: "crvUSDETHCRV",
    type: TokenType.CURVE_LP_TOKEN,
    pool: "CURVE_TRI_CRV_POOL",
    tokenOut: ["crvUSD", "WETH", "CRV"],
  },
  ...curveMetaTokens,
};

export const isCurveLPToken = (t: unknown): t is CurveLPToken =>
  typeof t === "string" && !!curveTokens[t as CurveLPToken];

export const isCurveMetaToken = (t: unknown): t is CurveMetaTokens =>
  typeof t === "string" && !!curveMetaTokens[t as CurveMetaTokens];
