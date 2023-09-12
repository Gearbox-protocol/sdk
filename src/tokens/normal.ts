import type { TokenBase } from "./token";
import { TokenType } from "./tokenType";

export type NormalToken =
  | "1INCH"
  | "AAVE"
  | "COMP"
  | "CRV"
  | "DPI"
  | "FEI"
  | "LINK"
  | "SNX"
  | "UNI"
  | "USDT"
  | "USDC"
  | "DAI"
  | "WETH"
  | "WBTC"
  | "YFI"

  // NEW TOKENS
  | "STETH"
  | "wstETH"
  | "CVX"
  | "FRAX"
  | "FXS"
  | "LDO"
  | "LUSD"
  | "sUSD"
  | "GUSD"
  | "LQTY"
  | "OHM"
  | "MIM"
  | "SPELL"
  | "GMX"
  | "ARB"
  | "RDNT"
  | "BAL"
  | "ARB"
  | "MKR"
  | "RPL"
  | "APE"

  // REDSTONE
  | "SHIB"

  // crvUSD
  | "crvUSD";

export type NormalTokenData = {
  symbol: NormalToken;
  type: TokenType.NORMAL_TOKEN;
} & TokenBase;

export const normalTokens: Record<NormalToken, NormalTokenData> = {
  "1INCH": {
    name: "1INCH",

    symbol: "1INCH",
    type: TokenType.NORMAL_TOKEN,
  },

  AAVE: {
    name: "AAVE",

    symbol: "AAVE",
    type: TokenType.NORMAL_TOKEN,
  },

  COMP: {
    name: "COMP",

    symbol: "COMP",
    type: TokenType.NORMAL_TOKEN,
  },

  CRV: {
    name: "CRV",

    symbol: "CRV",
    type: TokenType.NORMAL_TOKEN,
  },

  DAI: {
    name: "DAI",

    symbol: "DAI",
    type: TokenType.NORMAL_TOKEN,
  },

  DPI: {
    name: "DPI",

    symbol: "DPI",
    type: TokenType.NORMAL_TOKEN,
  },

  FEI: {
    name: "FEI",

    symbol: "FEI",
    type: TokenType.NORMAL_TOKEN,
  },

  LINK: {
    name: "LINK",

    symbol: "LINK",
    type: TokenType.NORMAL_TOKEN,
  },

  SNX: {
    name: "SNX",

    symbol: "SNX",
    type: TokenType.NORMAL_TOKEN,
  },

  UNI: {
    name: "UNI",

    symbol: "UNI",
    type: TokenType.NORMAL_TOKEN,
  },

  USDC: {
    name: "USDC",

    symbol: "USDC",
    type: TokenType.NORMAL_TOKEN,
  },

  USDT: {
    name: "USDT",

    symbol: "USDT",
    type: TokenType.NORMAL_TOKEN,
  },

  WBTC: {
    name: "WBTC",

    symbol: "WBTC",
    type: TokenType.NORMAL_TOKEN,
  },

  WETH: {
    name: "WETH",

    symbol: "WETH",
    type: TokenType.NORMAL_TOKEN,
  },

  YFI: {
    name: "YFI",

    symbol: "YFI",
    type: TokenType.NORMAL_TOKEN,
  },

  /// UPDATE
  STETH: {
    name: "stETH",

    symbol: "STETH",
    type: TokenType.NORMAL_TOKEN,
  },

  wstETH: {
    name: "wstETH",

    symbol: "wstETH",
    type: TokenType.NORMAL_TOKEN,
  },

  CVX: {
    name: "CVX",

    symbol: "CVX",
    type: TokenType.NORMAL_TOKEN,
  },

  FRAX: {
    name: "FRAX",

    symbol: "FRAX",
    type: TokenType.NORMAL_TOKEN,
  },

  FXS: {
    name: "FXS",

    symbol: "FXS",
    type: TokenType.NORMAL_TOKEN,
  },

  LDO: {
    name: "LDO",

    symbol: "LDO",
    type: TokenType.NORMAL_TOKEN,
  },

  LUSD: {
    name: "LUSD",

    symbol: "LUSD",
    type: TokenType.NORMAL_TOKEN,
  },

  sUSD: {
    name: "sUSD",

    symbol: "sUSD",
    type: TokenType.NORMAL_TOKEN,
  },

  GUSD: {
    name: "GUSD",

    symbol: "GUSD",
    type: TokenType.NORMAL_TOKEN,
  },

  LQTY: {
    name: "LQTY",

    symbol: "LQTY",
    type: TokenType.NORMAL_TOKEN,
  },

  OHM: {
    name: "OHM",

    symbol: "OHM",
    type: TokenType.NORMAL_TOKEN,
  },
  MIM: {
    name: "MIM",

    symbol: "MIM",
    type: TokenType.NORMAL_TOKEN,
  },
  SPELL: {
    name: "SPELL",

    symbol: "SPELL",
    type: TokenType.NORMAL_TOKEN,
  },
  GMX: {
    name: "GMX",

    symbol: "GMX",
    type: TokenType.NORMAL_TOKEN,
  },
  ARB: {
    name: "ARB",

    symbol: "ARB",
    type: TokenType.NORMAL_TOKEN,
  },
  RDNT: {
    name: "RDNT",

    symbol: "RDNT",
    type: TokenType.NORMAL_TOKEN,
  },
  BAL: {
    name: "BAL",

    symbol: "BAL",
    type: TokenType.NORMAL_TOKEN,
  },
  SHIB: {
    name: "SHIB",
    symbol: "SHIB",
    type: TokenType.NORMAL_TOKEN,
  },

  crvUSD: {
    name: "crvUSD",
    symbol: "crvUSD",
    type: TokenType.NORMAL_TOKEN,
  },

  MKR: {
    name: "MKR",

    symbol: "MKR",
    type: TokenType.NORMAL_TOKEN,
  },
  RPL: {
    name: "RPL",

    symbol: "RPL",
    type: TokenType.NORMAL_TOKEN,
  },
  APE: {
    name: "APE",

    symbol: "APE",
    type: TokenType.NORMAL_TOKEN,
  },
};

export const isNormalToken = (t: unknown): t is NormalToken =>
  typeof t === "string" && !!normalTokens[t as NormalToken];
