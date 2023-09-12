import type { YearnVaultContract } from "../contracts/contracts";
import type { CurveLPToken } from "./curveLP";
import { NormalToken } from "./normal";
import type { TokenBase } from "./token";
import { TokenType } from "./tokenType";

export type YearnLPToken =
  | "yvDAI"
  | "yvUSDC"
  | "yvWETH"
  | "yvWBTC"
  | "yvCurve_stETH"
  | "yvCurve_FRAX";

export type YearnVaultTokenData = {
  symbol: YearnLPToken;
  type: TokenType.YEARN_ON_NORMAL_TOKEN;
  underlying: NormalToken;
  vault: YearnVaultContract;
} & TokenBase;

export type YearnVaultOfCurveLPTokenData = {
  symbol: YearnLPToken;
  type: TokenType.YEARN_ON_CURVE_TOKEN;
  underlying: CurveLPToken;
  vault: YearnVaultContract;
} & TokenBase;

export type YearnVaultOfMetaCurveLPTokenData = {
  symbol: YearnLPToken;
  type: TokenType.YEARN_ON_CURVE_TOKEN;
  underlying: CurveLPToken;
  vault: YearnVaultContract;
} & TokenBase;

export const yearnTokens: Record<
  YearnLPToken,
  | YearnVaultTokenData
  | YearnVaultOfCurveLPTokenData
  | YearnVaultOfMetaCurveLPTokenData
> = {
  // YEARN TOKENS
  yvDAI: {
    name: "Yearn yvDAI",
    symbol: "yvDAI",
    type: TokenType.YEARN_ON_NORMAL_TOKEN,
    underlying: "DAI",
    vault: "YEARN_DAI_VAULT",
  },

  yvUSDC: {
    name: "Yearn yvUSDC",
    symbol: "yvUSDC",
    type: TokenType.YEARN_ON_NORMAL_TOKEN,
    underlying: "USDC",
    vault: "YEARN_USDC_VAULT",
  },

  yvWETH: {
    name: "Yearn yvWETH",
    symbol: "yvWETH",
    type: TokenType.YEARN_ON_NORMAL_TOKEN,
    underlying: "WETH",
    vault: "YEARN_WETH_VAULT",
  },

  yvWBTC: {
    name: "Yearn yvWBTC",
    symbol: "yvWBTC",
    type: TokenType.YEARN_ON_NORMAL_TOKEN,
    underlying: "WBTC",
    vault: "YEARN_WBTC_VAULT",
  },

  // YEARN- CURVE TOKENS
  yvCurve_stETH: {
    name: "Yearn yvCurve-stETH",
    symbol: "yvCurve_stETH",
    type: TokenType.YEARN_ON_CURVE_TOKEN,
    underlying: "steCRV",
    vault: "YEARN_CURVE_STETH_VAULT",
  },

  yvCurve_FRAX: {
    name: "Yearn yvCurve-FRAX",
    symbol: "yvCurve_FRAX",
    type: TokenType.YEARN_ON_CURVE_TOKEN,
    underlying: "FRAX3CRV",
    vault: "YEARN_CURVE_FRAX_VAULT",
  },
};

export const isYearnLPToken = (t: unknown): t is YearnLPToken =>
  typeof t === "string" && !!yearnTokens[t as YearnLPToken];
