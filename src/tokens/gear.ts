import type { TokenBase } from "./token";
import { TokenType } from "./tokenType";

export type DieselTokenTypes =
  | "dDAI"
  | "dUSDC"
  | "dWBTC"
  | "dWETH"
  | "dwstETH"
  | "dFRAX";
export type GearboxToken = "GEAR";

export type DieselTokenData = {
  symbol: DieselTokenTypes;
  type: TokenType.DIESEL_LP_TOKEN;
} & TokenBase;

export type GearboxTokenData = {
  symbol: GearboxToken;
  type: TokenType.GEAR_TOKEN;
} & TokenBase;

const dieselTokens: Record<DieselTokenTypes, DieselTokenData> = {
  // GEARBOX
  dDAI: {
    name: "dDAI",
    symbol: "dDAI",
    type: TokenType.DIESEL_LP_TOKEN,
  },

  dUSDC: {
    name: "dUSDC",
    symbol: "dUSDC",
    type: TokenType.DIESEL_LP_TOKEN,
  },

  dWBTC: {
    name: "dWBTC",
    symbol: "dWBTC",
    type: TokenType.DIESEL_LP_TOKEN,
  },

  dWETH: {
    name: "dWETH",
    symbol: "dWETH",
    type: TokenType.DIESEL_LP_TOKEN,
  },

  dwstETH: {
    name: "dwstETH",
    symbol: "dwstETH",
    type: TokenType.DIESEL_LP_TOKEN,
  },

  dFRAX: {
    name: "dFRAX",
    symbol: "dFRAX",
    type: TokenType.DIESEL_LP_TOKEN,
  },
};

export const gearTokens: Record<
  DieselTokenTypes | GearboxToken,
  DieselTokenData | GearboxTokenData
> = {
  ...dieselTokens,
  GEAR: {
    name: "GEAR",
    symbol: "GEAR",
    type: TokenType.GEAR_TOKEN,
  },
};

export const isDieselToken = (t: unknown): t is DieselTokenTypes =>
  typeof t === "string" && !!dieselTokens[t as DieselTokenTypes];
