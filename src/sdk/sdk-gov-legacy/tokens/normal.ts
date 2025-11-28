import type { TokenBase } from "./token.js";
import type { TokenNetwork } from "./tokenType.js";
import { TokenType } from "./tokenType.js";

export type NormalToken =
  | "1INCH"
  | "AAVE"
  | "CRV"
  | "LINK"
  | "SNX"
  | "UNI"
  | "USDT"
  | "DOLA"
  | "USDC"
  | "USDC_e"
  | "DAI"
  | "WETH"
  | "WBTC"
  | "tBTC"
  | "YFI"
  | "WLD"
  | "OP"

  // NEW TOKENS
  | "STETH"
  | "CVX"
  | "FRAX"
  | "FXS"
  | "LDO"
  | "LUSD"
  | "sUSD"
  | "GUSD"
  | "LQTY"
  | "GMX"
  | "ARB"
  | "BAL"
  | "ARB"
  | "MKR"
  | "RPL"
  | "APE"
  | "rETH"
  | "AURA"
  | "LBTC"
  | "eBTC"
  | "solvBTC"
  | "pumpBTC"
  | "osETH"
  | "weETH"
  | "SWISE"
  | "ezETH"
  | "rsETH"
  | "PENDLE"
  | "frxETH"
  | "cbETH"
  | "rswETH"
  | "USDe"
  | "GHO"
  | "pufETH"
  | "wstETH"
  | "USDS"
  | "SKY"
  | "beraSTONE"
  | "wS"
  | "stS"
  | "scUSD"
  | "T"
  | "tETH"
  | "USDL"
  | "wUSDL"
  | "csUSDL"
  | "RLUSD"
  | "MORPHO"

  // Mellow LRTs
  | "steakLRT"
  | "Re7LRT"
  | "amphrETH"
  | "rstETH"
  | "pzETH"
  | "DVstETH"
  | "waEthLidowstETH"
  // Pendle
  | "PT_rsETH_26SEP2024"
  | "PT_sUSDe_26DEC2024"
  | "PT_eETH_26DEC2024"
  | "PT_ezETH_26DEC2024"
  | "PT_eBTC_26DEC2024"
  | "PT_LBTC_27MAR2025"
  | "PT_corn_solvBTC_BBN_26DEC2024"
  | "PT_corn_pumpBTC_26DEC2024"
  | "PT_cornLBTC_26DEC2024"
  | "PT_corn_eBTC_27MAR2025"
  | "PT_sUSDe_27MAR2025"
  | "PT_sUSDe_29MAY2025"
  | "PT_beraSTONE_10APR2025"
  | "PT_sUSDX_1SEP2025"

  // Balancer V3
  | "rstETH_Lido_wstETH"
  | "DVstETH_Prime_wstETH"

  // REDSTONE
  | "SHIB"

  // crvUSD
  | "crvUSD"
  | "WBNB"
  | "BTCB"
  | "USD1"
  | "USDX"
  | "cp0xLRT"
  | "uptBTC"
  | "PT_uptBTC_14AUG2025"
  | "WXTZ"
  | "mTBILL"
  | "mBASIS"
  | "lskETH"
  | "hemiBTC"
  | "bfBTC"
  | "sUSDf"
  | "PT_sUSDf_25SEP2025"
  | "stkcvxUSDCUSDf"
  | "PT_USDf_29JAN2026";

export type NormalTokenData = {
  symbol: NormalToken;
  type: Partial<Record<TokenNetwork, TokenType.NORMAL_TOKEN>>;
} & TokenBase;

export const normalTokens: Record<NormalToken, NormalTokenData> = {
  "1INCH": {
    name: "1INCH",

    symbol: "1INCH",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  AAVE: {
    name: "AAVE",

    symbol: "AAVE",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  CRV: {
    name: "CRV",

    symbol: "CRV",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  DAI: {
    name: "DAI",

    symbol: "DAI",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  LINK: {
    name: "LINK",

    symbol: "LINK",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  SNX: {
    name: "SNX",

    symbol: "SNX",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  UNI: {
    name: "UNI",

    symbol: "UNI",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  USDC: {
    name: "USDC",

    symbol: "USDC",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  USDC_e: {
    name: "USDC (Bridged)",

    symbol: "USDC_e",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  USDT: {
    name: "USDT",

    symbol: "USDT",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  DOLA: {
    name: "DOLA",

    symbol: "DOLA",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  WBTC: {
    name: "WBTC",

    symbol: "WBTC",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  tBTC: {
    name: "tBTC",

    symbol: "tBTC",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  WETH: {
    name: "WETH",

    symbol: "WETH",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  YFI: {
    name: "YFI",

    symbol: "YFI",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  WLD: {
    name: "WLD",
    symbol: "WLD",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  OP: {
    name: "OP",
    symbol: "OP",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  /// UPDATE
  STETH: {
    name: "stETH",

    symbol: "STETH",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  CVX: {
    name: "CVX",

    symbol: "CVX",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  FRAX: {
    name: "FRAX",

    symbol: "FRAX",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  FXS: {
    name: "FXS",

    symbol: "FXS",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  LDO: {
    name: "LDO",

    symbol: "LDO",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  LUSD: {
    name: "LUSD",

    symbol: "LUSD",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  sUSD: {
    name: "sUSD",

    symbol: "sUSD",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  GUSD: {
    name: "GUSD",

    symbol: "GUSD",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  LQTY: {
    name: "LQTY",

    symbol: "LQTY",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  GMX: {
    name: "GMX",

    symbol: "GMX",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  ARB: {
    name: "ARB",

    symbol: "ARB",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  BAL: {
    name: "BAL",

    symbol: "BAL",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  SHIB: {
    name: "SHIB",
    symbol: "SHIB",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  crvUSD: {
    name: "crvUSD",
    symbol: "crvUSD",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  MKR: {
    name: "MKR",

    symbol: "MKR",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  RPL: {
    name: "RPL",

    symbol: "RPL",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  APE: {
    name: "APE",

    symbol: "APE",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  LBTC: {
    name: "LBTC",

    symbol: "LBTC",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  eBTC: {
    name: "eBTC",
    symbol: "eBTC",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  solvBTC: {
    name: "solvBTC",
    symbol: "solvBTC",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  pumpBTC: {
    name: "pumpBTC",
    symbol: "pumpBTC",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  rETH: {
    name: "Rocket Pool ETH",
    symbol: "rETH",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  AURA: {
    name: "Aura Token",
    symbol: "AURA",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  osETH: {
    name: "Stakewise ETH",
    symbol: "osETH",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  weETH: {
    name: "ether.fi ETH",
    symbol: "weETH",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  SWISE: {
    name: "StakeWise",
    symbol: "SWISE",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  ezETH: {
    name: "Renzo Restaked ETH",
    symbol: "ezETH",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  rsETH: {
    name: "Kelp Restaked ETH",
    symbol: "rsETH",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  beraSTONE: {
    name: "Berachain STONE",
    symbol: "beraSTONE",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  wS: {
    name: "Wrapped Sonic",
    symbol: "wS",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  stS: {
    name: "Beets Staked Sonic",
    symbol: "stS",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  scUSD: {
    name: "Sonic USD",
    symbol: "scUSD",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  frxETH: {
    name: "Frax ETH",
    symbol: "frxETH",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  PENDLE: {
    name: "Pendle",
    symbol: "PENDLE",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  MORPHO: {
    name: "Morpho Token",
    symbol: "MORPHO",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  cbETH: {
    name: "Coinbase ETH",
    symbol: "cbETH",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  rswETH: {
    name: "Restaked Swell ETH",
    symbol: "rswETH",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  USDe: {
    name: "Ethena USDe",
    symbol: "USDe",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  GHO: {
    name: "Gho Token",
    symbol: "GHO",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  pufETH: {
    name: "Puffer Restaked ETH",
    symbol: "pufETH",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  wstETH: {
    name: "Wrapped stETH",
    symbol: "wstETH",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  tETH: {
    name: "Treehouse ETH",
    symbol: "tETH",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  USDL: {
    name: "Lift Dollar",
    symbol: "USDL",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  wUSDL: {
    name: "Wrapped USDL",
    symbol: "wUSDL",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  csUSDL: {
    name: "Coinshift USDL",
    symbol: "csUSDL",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  RLUSD: {
    name: "RLUSD",
    symbol: "RLUSD",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  // Mellow
  steakLRT: {
    name: "Steakhouse Mellow LRT",
    symbol: "steakLRT",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  Re7LRT: {
    name: "Re7 Mellow LRT",
    symbol: "Re7LRT",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  amphrETH: {
    name: "Mev Capital Mellow LRT",
    symbol: "amphrETH",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  rstETH: {
    name: "P2P Mellow LRT",
    symbol: "rstETH",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  pzETH: {
    name: "Renzo Mellow LST",
    symbol: "pzETH",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  DVstETH: {
    name: "Decentralized Validator Token",
    symbol: "DVstETH",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  waEthLidowstETH: {
    name: "Wrapped Aave Ethereum Lido wstETH",
    symbol: "waEthLidowstETH",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  PT_rsETH_26SEP2024: {
    name: "Pendle PT rsETH 26 Sep 2024 expiry",
    symbol: "PT_rsETH_26SEP2024",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  USDS: {
    name: "USDS",
    symbol: "USDS",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  SKY: {
    name: "SKY Governance token",
    symbol: "SKY",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  T: {
    name: "Threshold Network Token",
    symbol: "T",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  PT_sUSDe_26DEC2024: {
    name: "Pendle PT sUSDe 26 Dec 2024 expiry",
    symbol: "PT_sUSDe_26DEC2024",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  PT_eETH_26DEC2024: {
    name: "Pendle PT weETH 26 Dec 2024 expiry",
    symbol: "PT_eETH_26DEC2024",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  PT_ezETH_26DEC2024: {
    name: "Pendle PT ezETH 26 Dec 2024 expiry",
    symbol: "PT_ezETH_26DEC2024",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  PT_eBTC_26DEC2024: {
    name: "Pendle PT eBTC 26 Dec 2024 expiry",
    symbol: "PT_eBTC_26DEC2024",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  PT_LBTC_27MAR2025: {
    name: "Pendle PT LBTC 27 Mar 2025 expiry",
    symbol: "PT_LBTC_27MAR2025",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  PT_corn_solvBTC_BBN_26DEC2024: {
    name: "Pendle PT Corn solvBTC Babylon 26 Dec 2024 expiry",
    symbol: "PT_corn_solvBTC_BBN_26DEC2024",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  PT_corn_pumpBTC_26DEC2024: {
    name: "Pendle PT Corn pumpBTC 26 Dec 2024 expiry",
    symbol: "PT_corn_pumpBTC_26DEC2024",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  PT_cornLBTC_26DEC2024: {
    name: "Pendle PT Corn Lombard LBTC 26 Dec 2024 expiry",
    symbol: "PT_cornLBTC_26DEC2024",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  PT_corn_eBTC_27MAR2025: {
    name: "Pendle PT Corn ether.fi eBTC 27 Mar 2025 expiry",
    symbol: "PT_corn_eBTC_27MAR2025",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  PT_sUSDe_27MAR2025: {
    name: "Pendle PT Ethena sUSDE 27 Mar 2025 expiry",
    symbol: "PT_sUSDe_27MAR2025",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  PT_sUSDe_29MAY2025: {
    name: "Pendle PT Ethena sUSDE 29 May 2025 expiry",
    symbol: "PT_sUSDe_29MAY2025",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  PT_beraSTONE_10APR2025: {
    name: "Pendle PT Berachain STONE 10 April 2025 expiry",
    symbol: "PT_beraSTONE_10APR2025",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  rstETH_Lido_wstETH: {
    name: "Balancer V3 rstETH-Lido wstETH",
    symbol: "rstETH_Lido_wstETH",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  DVstETH_Prime_wstETH: {
    name: "Balancer V3 DVstETH-Prime wstETH",
    symbol: "DVstETH_Prime_wstETH",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  WBNB: {
    name: "WBNB",
    symbol: "WBNB",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  BTCB: {
    name: "BTCB",
    symbol: "BTCB",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  USD1: {
    name: "USD1",
    symbol: "USD1",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  USDX: {
    name: "USDX",
    symbol: "USDX",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  cp0xLRT: {
    name: "cp0xLRT",
    symbol: "cp0xLRT",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  uptBTC: {
    name: "uptBTC",
    symbol: "uptBTC",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  PT_uptBTC_14AUG2025: {
    name: "Pendle PT uptBTC 14 August 2025 expiry",
    symbol: "PT_uptBTC_14AUG2025",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  WXTZ: {
    name: "WXTZ",
    symbol: "WXTZ",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  mBASIS: {
    name: "mBASIS",
    symbol: "mBASIS",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  mTBILL: {
    name: "mTBILL",
    symbol: "mTBILL",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  PT_sUSDX_1SEP2025: {
    name: "Pendle PT sUSDX 1 September 2025 expiry",
    symbol: "PT_sUSDX_1SEP2025",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  lskETH: {
    name: "lskETH",
    symbol: "lskETH",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  hemiBTC: {
    name: "hemiBTC",
    symbol: "hemiBTC",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  bfBTC: {
    name: "bfBTC",
    symbol: "bfBTC",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },

  sUSDf: {
    name: "sUSDf",
    symbol: "sUSDf",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  PT_sUSDf_25SEP2025: {
    name: "Pendle PT sUSDf 25 September 2025 expiry",
    symbol: "PT_sUSDf_25SEP2025",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  PT_USDf_29JAN2026: {
    name: "Pendle PT USDf 29 January 2026 expiry",
    symbol: "PT_USDf_29JAN2026",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
  stkcvxUSDCUSDf: {
    name: "Convex stkcvxUSDCUSDf",
    symbol: "stkcvxUSDCUSDf",
    type: { AllNetworks: TokenType.NORMAL_TOKEN },
  },
};
