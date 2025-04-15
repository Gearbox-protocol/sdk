import type { YearnVaultContract } from "../contracts/index.js";
import type { CurveLPToken } from "./curveLP.js";
import type { NormalToken } from "./normal.js";
import type { TokenBase } from "./token.js";
import type { TokenNetwork } from "./tokenType.js";
import { TokenType } from "./tokenType.js";

export type YearnLPToken =
  | "yvDAI"
  | "yvUSDC"
  | "yvUSDC_e"
  | "yvWETH"
  | "yvWBTC"
  | "yvUSDT"
  | "yvOP"
  | "yvCurve_stETH"
  | "yvCurve_FRAX";

export type YearnVaultTokenData = {
  symbol: YearnLPToken;
  type: Partial<Record<TokenNetwork, TokenType.YEARN_ON_NORMAL_TOKEN>>;
  underlying: NormalToken;
  vault: YearnVaultContract;
} & TokenBase;

export type YearnVaultOfCurveLPTokenData = {
  symbol: YearnLPToken;
  type: Partial<Record<TokenNetwork, TokenType.YEARN_ON_CURVE_TOKEN>>;
  underlying: CurveLPToken;
  vault: YearnVaultContract;
} & TokenBase;

export type YearnVaultOfMetaCurveLPTokenData = {
  symbol: YearnLPToken;
  type: Partial<Record<TokenNetwork, TokenType.YEARN_ON_CURVE_TOKEN>>;
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
    type: { AllNetworks: TokenType.YEARN_ON_NORMAL_TOKEN },
    underlying: "DAI",
    vault: "YEARN_DAI_VAULT",
  },

  yvUSDC: {
    name: "Yearn yvUSDC",
    symbol: "yvUSDC",
    type: { AllNetworks: TokenType.YEARN_ON_NORMAL_TOKEN },
    underlying: "USDC",
    vault: "YEARN_USDC_VAULT",
  },

  yvUSDC_e: {
    name: "Yearn yvUSDC.e",
    symbol: "yvUSDC_e",
    type: { AllNetworks: TokenType.YEARN_ON_NORMAL_TOKEN },
    underlying: "USDC_e",
    vault: "YEARN_USDC_E_VAULT",
  },

  yvWETH: {
    name: "Yearn yvWETH",
    symbol: "yvWETH",
    type: { AllNetworks: TokenType.YEARN_ON_NORMAL_TOKEN },
    underlying: "WETH",
    vault: "YEARN_WETH_VAULT",
  },

  yvWBTC: {
    name: "Yearn yvWBTC",
    symbol: "yvWBTC",
    type: { AllNetworks: TokenType.YEARN_ON_NORMAL_TOKEN },
    underlying: "WBTC",
    vault: "YEARN_WBTC_VAULT",
  },

  yvUSDT: {
    name: "Yearn yvUSDT",
    symbol: "yvUSDT",
    type: { AllNetworks: TokenType.YEARN_ON_NORMAL_TOKEN },
    underlying: "USDT",
    vault: "YEARN_USDT_VAULT",
  },

  yvOP: {
    name: "Yearn yvOP",
    symbol: "yvOP",
    type: { AllNetworks: TokenType.YEARN_ON_NORMAL_TOKEN },
    underlying: "OP",
    vault: "YEARN_OP_VAULT",
  },

  // YEARN- CURVE TOKENS
  yvCurve_stETH: {
    name: "Yearn yvCurve-stETH",
    symbol: "yvCurve_stETH",
    type: { AllNetworks: TokenType.YEARN_ON_CURVE_TOKEN },
    underlying: "steCRV",
    vault: "YEARN_CURVE_STETH_VAULT",
  },

  yvCurve_FRAX: {
    name: "Yearn yvCurve-FRAX",
    symbol: "yvCurve_FRAX",
    type: { AllNetworks: TokenType.YEARN_ON_CURVE_TOKEN },
    underlying: "FRAX3CRV",
    vault: "YEARN_CURVE_FRAX_VAULT",
  },
};

export const isYearnLPToken = (t: unknown): t is YearnLPToken =>
  typeof t === "string" && !!yearnTokens[t as YearnLPToken];
