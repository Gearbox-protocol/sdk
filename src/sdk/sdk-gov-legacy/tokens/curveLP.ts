import type { CurvePoolContract } from "../contracts/index.js";
import type { ERC4626LPToken } from "./erc4626.js";
import type { NormalToken } from "./normal.js";
import type { SupportedToken, TokenBase } from "./token.js";
import type { TokenNetwork } from "./tokenType.js";
import { TokenType } from "./tokenType.js";
import type { WrappedToken } from "./wrapped.js";

export type CurveMetaTokens = "FRAX3CRV" | "LUSD3CRV" | "gusd3CRV";

export type CurveLPToken =
  | CurveMetaTokens
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
  | "rETH_f"
  | "USDeUSDC"
  | "FRAXUSDe"
  | "USDecrvUSD"
  | "USDeDAI"
  | "MtEthena"
  | "GHOUSDe"
  | "pufETHwstE"
  | "GHOcrvUSD"
  | "ezETHWETH"
  | "ezpzETH"
  | "LBTCWBTC"
  | "eBTCWBTC"
  | "pumpBTCWBTC"
  | "TriBTC"
  | "2BTC-f"
  | "FRAXsDAI"
  | "DOLAsUSDe"
  | "DOLAFRAXBP3CRV_f"
  | "crvUSDDOLA_f"
  | "crvUsUSDe"
  | "llamathena"
  | "tETHwstETH"
  | "tETHweETH"
  | "pzETHstETH"
  | "USDLUSDC"
  | "RLUSDUSDC"

  /// Arbitrum
  | "2CRV"
  | "3c-crvUSD"
  | "crvUSDC"
  | "crvUSDT"
  | "crvUSDC_e"
  | "USDEUSDC"

  // Optimism
  | "3CRV"
  | "wstETHCRV";

export type CurveLPTokenData = {
  symbol: CurveLPToken;
  type: Partial<Record<TokenNetwork, TokenType.CURVE_LP_TOKEN>>;
  tokenOut: Array<CurveLPToken | WrappedToken | ERC4626LPToken | NormalToken>;
  pool: CurvePoolContract;
  wrapper?: CurvePoolContract;
} & TokenBase;

export type MetaCurveLPTokenData = {
  symbol: CurveLPToken;
  type: Partial<Record<TokenNetwork, TokenType.CURVE_LP_TOKEN>>;
  tokenOut: Array<CurveLPToken | WrappedToken | ERC4626LPToken | NormalToken>;
  pool: CurvePoolContract;
  wrapper?: CurvePoolContract;
} & TokenBase;

export const Curve3CrvUnderlyingTokenIndex: Partial<
  Record<SupportedToken, bigint>
> = {
  DAI: 0n,
  USDC: 1n,
  USDT: 2n,
};

export const curveMetaTokens: Record<CurveMetaTokens, MetaCurveLPTokenData> = {
  //  META CURVE LP TOKENS
  FRAX3CRV: {
    name: "Curve FRAX3CRV-f",
    symbol: "FRAX3CRV",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_FRAX_POOL",
    tokenOut: ["FRAX", "3Crv"],
  },

  LUSD3CRV: {
    name: "Curve LUSD3CRV-f",
    symbol: "LUSD3CRV",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_LUSD_POOL",
    tokenOut: ["LUSD", "3Crv"],
  },

  gusd3CRV: {
    name: "Curve gusd3CRV",
    symbol: "gusd3CRV",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_GUSD_POOL",
    tokenOut: ["GUSD", "3Crv"],
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
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_3CRV_POOL",
    tokenOut: ["DAI", "USDC", "USDT"],
  },

  crvFRAX: {
    name: "Curve.fi FRAX/USDC",
    symbol: "crvFRAX",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_FRAX_USDC_POOL",
    tokenOut: ["FRAX", "USDC"],
  },

  steCRV: {
    name: "Curve steCRV",
    symbol: "steCRV",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_STETH_GATEWAY",
    tokenOut: ["STETH", "WETH"],
  },

  crvPlain3andSUSD: {
    name: "Curve crvPlain3andSUSD",
    symbol: "crvPlain3andSUSD",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_SUSD_POOL",
    wrapper: "CURVE_SUSD_DEPOSIT",
    tokenOut: ["DAI", "USDC", "USDT", "sUSD"],
  },
  crvCRVETH: {
    name: "Curve CRV-ETH",
    symbol: "crvCRVETH",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_CRVETH_POOL",
    tokenOut: ["WETH", "CRV"],
  },
  crvCVXETH: {
    name: "Curve CVX-ETH",
    symbol: "crvCVXETH",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_CVXETH_POOL",
    tokenOut: ["WETH", "CVX"],
  },
  crvUSDTWBTCWETH: {
    name: "Curve USDT/WBTC/WETH",
    symbol: "crvUSDTWBTCWETH",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_3CRYPTO_POOL",
    tokenOut: ["USDT", "WBTC", "WETH"],
  },
  LDOETH: {
    name: "Curve LDOETH",
    symbol: "LDOETH",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_LDOETH_POOL",
    tokenOut: ["LDO", "WETH"],
  },

  crvUSDUSDC: {
    name: "Curve crvUSDUSDC",
    symbol: "crvUSDUSDC",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_CRVUSD_USDC_POOL",
    tokenOut: ["crvUSD", "USDC"],
  },
  crvUSDUSDT: {
    name: "Curve crvUSDUSDT",
    symbol: "crvUSDUSDT",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_CRVUSD_USDT_POOL",
    tokenOut: ["crvUSD", "USDT"],
  },
  crvUsUSDe: {
    name: "Curve crvUsUSDe",
    symbol: "crvUsUSDe",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_CRVUSD_SUSDE_POOL",
    tokenOut: ["crvUSD", "sUSDe"],
  },

  llamathena: {
    name: "Curve llamathena",
    symbol: "llamathena",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_LLAMA_THENA_POOL",
    tokenOut: ["scrvUSD", "sUSDe"],
  },
  crvUSDFRAX: {
    name: "Curve crvUSDFRAX",
    symbol: "crvUSDFRAX",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_CRVUSD_FRAX_POOL",
    tokenOut: ["crvUSD", "FRAX"],
  },

  crvUSDETHCRV: {
    name: "Curve crvUSDETHCRV",
    symbol: "crvUSDETHCRV",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_TRI_CRV_POOL",
    tokenOut: ["crvUSD", "WETH", "CRV"],
  },

  rETH_f: {
    name: "Curve.fi Factory Crypto Pool: Rocketpool rETH/ETH",
    symbol: "rETH_f",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_RETH_ETH_POOL",
    tokenOut: ["rETH", "WETH"],
  },

  DOLAFRAXBP3CRV_f: {
    name: "Curve.fi Factory USD Metapool: DOLA/FRAXBP",
    symbol: "DOLAFRAXBP3CRV_f",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_DOLA_FRAXBP_POOL",
    tokenOut: ["DOLA", "crvFRAX"],
  },

  crvUSDDOLA_f: {
    name: "Curve.fi Factory Plain Pool: crvUSD/DOLA",
    symbol: "crvUSDDOLA_f",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_DOLA_CRVUSD_POOL",
    tokenOut: ["DOLA", "crvUSD"],
  },

  USDeUSDC: {
    name: "Curve USDe-USDC Pool",
    symbol: "USDeUSDC",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_USDE_USDC_POOL",
    tokenOut: ["USDe", "USDC"],
  },

  FRAXUSDe: {
    name: "Curve FRAX-USDe Pool",
    symbol: "FRAXUSDe",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_FRAX_USDE_POOL",
    tokenOut: ["FRAX", "USDe"],
  },

  USDecrvUSD: {
    name: "Curve USDe-crvUSD Pool",
    symbol: "USDecrvUSD",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_USDE_CRVUSD_POOL",
    tokenOut: ["USDe", "crvUSD"],
  },

  FRAXsDAI: {
    name: "Curve FRAX-sDAI Pool",
    symbol: "FRAXsDAI",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_FRAX_SDAI_POOL",
    tokenOut: ["FRAX", "sDAI"],
  },

  DOLAsUSDe: {
    name: "Curve DOLA-sUSDe Pool",
    symbol: "DOLAsUSDe",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_DOLA_SUSDE_POOL",
    tokenOut: ["DOLA", "sUSDe"],
  },

  USDeDAI: {
    name: "Curve USDe-DAI pool",
    symbol: "USDeDAI",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_USDE_DAI_POOL",
    tokenOut: ["USDe", "crvUSD"],
  },

  MtEthena: {
    name: "Curve sDAI-sUSDe Pool",
    symbol: "MtEthena",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_SDAI_SUSDE_POOL",
    tokenOut: ["sDAI", "sUSDe"],
  },

  GHOUSDe: {
    name: "Curve GHO-USDe Pool",
    symbol: "GHOUSDe",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_GHO_USDE_POOL",
    tokenOut: ["GHO", "USDe"],
  },

  pufETHwstE: {
    name: "Curve pufETH/wstETH Pool",
    symbol: "pufETHwstE",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_PUFETH_WSTETH_POOL",
    tokenOut: ["pufETH", "wstETH"],
  },

  GHOcrvUSD: {
    name: "Curve GHO/crvUSD Pool",
    symbol: "GHOcrvUSD",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_GHO_CRVUSD_POOL",
    tokenOut: ["GHO", "crvUSD"],
  },

  wstETHCRV: {
    name: "Curve wstETHCRV",
    symbol: "wstETHCRV",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_ETH_WSTETH_GATEWAY_OP",
    tokenOut: ["WETH", "wstETH"],
  },

  "2CRV": {
    name: "Curve 2CRV",
    symbol: "2CRV",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_2CRV_POOL_ARB",
    tokenOut: ["USDC_e", "USDT"],
  },

  "3c-crvUSD": {
    name: "Curve TriCrypto crvUSD",
    symbol: "3c-crvUSD",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_TRICRYPTO_CRVUSD_POOL_ARB",
    tokenOut: ["crvUSD", "WBTC", "WETH"],
  },

  crvUSDC: {
    name: "Curve crvUSD/USDC LP (Arbitrum)",
    symbol: "crvUSDC",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_CRVUSD_USDC_POOL_ARB",
    tokenOut: ["crvUSD", "USDC"],
  },

  crvUSDT: {
    name: "Curve crvUSD/USDT LP (Arbitrum)",
    symbol: "crvUSDT",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_CRVUSD_USDT_POOL_ARB",
    tokenOut: ["crvUSD", "USDT"],
  },

  crvUSDC_e: {
    name: "Curve crvUSD/USDC_e LP (Arbitrum)",
    symbol: "crvUSDC_e",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_CRVUSD_USDC_E_POOL_ARB",
    tokenOut: ["crvUSD", "USDC_e"],
  },

  USDEUSDC: {
    name: "Curve USDe/USDC LP (Arbitrum)",
    symbol: "USDEUSDC",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_USDE_USDC_POOL_ARB",
    tokenOut: ["USDC", "USDe"],
  },

  "3CRV": {
    name: "Curve 3Crv",
    symbol: "3CRV",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_3CRV_POOL_OP",
    tokenOut: ["DAI", "USDC_e", "USDT"],
  },

  ezETHWETH: {
    name: "Curve ezETH/WETH LP",
    symbol: "ezETHWETH",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_EZETH_ETH_POOL",
    tokenOut: ["ezETH", "WETH"],
  },

  ezpzETH: {
    name: "Curve ezETH/pzETH LP",
    symbol: "ezpzETH",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_EZPZ_ETH_POOL",
    tokenOut: ["ezETH", "pzETH"],
  },

  LBTCWBTC: {
    name: "Curve LBTC/WBTC LP",
    symbol: "LBTCWBTC",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_LBTC_WBTC_POOL",
    tokenOut: ["LBTC", "WBTC"],
  },
  eBTCWBTC: {
    name: "Curve eBTC/WBTC LP",
    symbol: "eBTCWBTC",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_EBTC_WBTC_POOL",
    tokenOut: ["eBTC", "WBTC"],
  },
  pumpBTCWBTC: {
    name: "Curve pumpBTC/WBTC LP",
    symbol: "pumpBTCWBTC",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_PUMPBTC_WBTC_POOL",
    tokenOut: ["pumpBTC", "WBTC"],
  },
  TriBTC: {
    name: "Curve Tri BTC-Fi LP",
    symbol: "TriBTC",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_TRIBTC_POOL",
    tokenOut: ["eBTC", "LBTC", "WBTC"],
  },
  "2BTC-f": {
    name: "Curve tBTC/WBTC LP",
    symbol: "2BTC-f",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_tBTC_WBTC_POOL",
    tokenOut: ["WBTC", "tBTC"],
  },
  tETHwstETH: {
    name: "Curve tETH/wstETH LP",
    symbol: "tETHwstETH",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_tETH_wstETH_POOL",
    tokenOut: ["tETH", "wstETH"],
  },
  tETHweETH: {
    name: "Curve tETH/weETH LP",
    symbol: "tETHweETH",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_tETH_weETH_POOL",
    tokenOut: ["tETH", "weETH"],
  },
  pzETHstETH: {
    name: "Curve pzETH/wstETH LP",
    symbol: "pzETHstETH",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_pzETH_stETH_POOL",
    tokenOut: ["pzETH", "wstETH"],
  },
  USDLUSDC: {
    name: "Curve USDL/USDC LP",
    symbol: "USDLUSDC",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_USDL_USDC_POOL",
    tokenOut: ["USDL", "USDC"],
  },
  RLUSDUSDC: {
    name: "Curve RLUSD/USDC LP",
    symbol: "RLUSDUSDC",
    type: { AllNetworks: TokenType.CURVE_LP_TOKEN },
    pool: "CURVE_RLUSD_USDC_POOL",
    tokenOut: ["USDC", "RLUSD"],
  },
  ...curveMetaTokens,
};

export const isCurveLPToken = (t: unknown): t is CurveLPToken =>
  typeof t === "string" && !!curveTokens[t as CurveLPToken];
