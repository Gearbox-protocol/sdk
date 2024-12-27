import type { TokenBase } from "./token";
import type { TokenNetwork } from "./tokenType";
import { TokenType } from "./tokenType";

export type DieselSimpleTokenTypes =
  | "dDAI"
  | "dUSDC"
  | "dWBTC"
  | "dWETH"
  | "dwstETH"
  | "dFRAX"
  | "dDOLAV3";

export type DieselTokenWithStkTypes =
  | "dUSDCV3"
  | "dWBTCV3"
  | "dWETHV3"
  | "dUSDTV3"
  | "dGHOV3"
  | "dDAIV3"
  | "dcrvUSDV3"
  | "dUSDC_eV3";

export type DieselTokenTypes = DieselSimpleTokenTypes | DieselTokenWithStkTypes;

export type DieselStakedTokenTypes =
  | "sdUSDCV3"
  | "sdWBTCV3"
  | "sdWETHV3"
  | "sdWETHV3_OLD"
  | "sdUSDTV3"
  | "sdGHOV3"
  | "sdDAIV3"
  | "sdcrvUSDV3"
  | "sdUSDC_eV3";

export type GearboxToken = "GEAR";

export type DieselSimpleTokenData = {
  symbol: DieselSimpleTokenTypes;
  type: Partial<Record<TokenNetwork, TokenType.DIESEL_LP_TOKEN>>;
} & TokenBase;

export type DieselWithStkTokenV3Data = {
  symbol: DieselTokenWithStkTypes;
  type: Partial<Record<TokenNetwork, TokenType.DIESEL_LP_TOKEN>>;
  stakedToken: DieselStakedTokenTypes;
  stakedToken_OLD?: DieselStakedTokenTypes;
} & TokenBase;

export type DieselStakedTokenData = {
  symbol: DieselStakedTokenTypes;
  type: Partial<Record<TokenNetwork, TokenType.DIESEL_LP_TOKEN>>;
  underlying: DieselTokenWithStkTypes;
} & TokenBase;

export type DieselTokenData = DieselSimpleTokenData | DieselWithStkTokenV3Data;

export type GearboxTokenData = {
  symbol: GearboxToken;
  type: Partial<Record<TokenNetwork, TokenType.GEAR_TOKEN>>;
} & TokenBase;

const dieselSimpleTokens: Record<
  DieselSimpleTokenTypes,
  DieselSimpleTokenData
> = {
  dDAI: {
    name: "dDAI",
    symbol: "dDAI",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
  },

  dUSDC: {
    name: "dUSDC",
    symbol: "dUSDC",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
  },

  dWBTC: {
    name: "dWBTC",
    symbol: "dWBTC",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
  },

  dWETH: {
    name: "dWETH",
    symbol: "dWETH",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
  },

  dwstETH: {
    name: "dwstETH",
    symbol: "dwstETH",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
  },

  dFRAX: {
    name: "dFRAX",
    symbol: "dFRAX",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
  },

  dDOLAV3: {
    name: "dDOLAV3",
    symbol: "dDOLAV3",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
  },
};

const dieselWithStkTokens: Record<
  DieselTokenWithStkTypes,
  DieselWithStkTokenV3Data
> = {
  dUSDCV3: {
    name: "dUSDCV3",
    symbol: "dUSDCV3",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
    stakedToken: "sdUSDCV3",
  },
  dUSDC_eV3: {
    name: "dUSDC.eV3",
    symbol: "dUSDC_eV3",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
    stakedToken: "sdUSDC_eV3",
  },
  dWBTCV3: {
    name: "dWBTCV3",
    symbol: "dWBTCV3",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
    stakedToken: "sdWBTCV3",
  },
  dWETHV3: {
    name: "dWETHV3",
    symbol: "dWETHV3",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
    stakedToken: "sdWETHV3",
    stakedToken_OLD: "sdWETHV3_OLD",
  },

  dUSDTV3: {
    name: "dUSDTV3",
    symbol: "dUSDTV3",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
    stakedToken: "sdUSDTV3",
  },
  dGHOV3: {
    name: "dGHOV3",
    symbol: "dGHOV3",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
    stakedToken: "sdGHOV3",
  },
  dDAIV3: {
    name: "dDAIV3",
    symbol: "dDAIV3",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
    stakedToken: "sdDAIV3",
  },
  dcrvUSDV3: {
    name: "dcrvUSDV3",
    symbol: "dcrvUSDV3",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
    stakedToken: "sdcrvUSDV3",
  },
};

const dieselTokens = { ...dieselSimpleTokens, ...dieselWithStkTokens };

const dieselStakedTokens: Record<
  DieselStakedTokenTypes,
  DieselStakedTokenData
> = {
  sdUSDCV3: {
    name: "sdUSDCV3",
    symbol: "sdUSDCV3",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
    underlying: "dUSDCV3",
  },
  sdUSDC_eV3: {
    name: "sdUSDC.eV3",
    symbol: "sdUSDC_eV3",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
    underlying: "dUSDC_eV3",
  },
  sdWBTCV3: {
    name: "sdWBTCV3",
    symbol: "sdWBTCV3",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
    underlying: "dWBTCV3",
  },
  sdWETHV3: {
    name: "sdWETHV3",
    symbol: "sdWETHV3",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
    underlying: "dWETHV3",
  },
  sdWETHV3_OLD: {
    name: "sdWETHV3 Old",
    symbol: "sdWETHV3_OLD",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
    underlying: "dWETHV3",
  },

  sdUSDTV3: {
    name: "sdUSDTV3",
    symbol: "sdUSDTV3",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
    underlying: "dUSDTV3",
  },
  sdGHOV3: {
    name: "sdGHOV3",
    symbol: "sdGHOV3",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
    underlying: "dGHOV3",
  },
  sdDAIV3: {
    name: "sdDAIV3",
    symbol: "sdDAIV3",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
    underlying: "dDAIV3",
  },
  sdcrvUSDV3: {
    name: "sdcrvUSDV3",
    symbol: "sdcrvUSDV3",
    type: { AllNetworks: TokenType.DIESEL_LP_TOKEN },
    underlying: "dcrvUSDV3",
  },
};

export const gearTokens: Record<
  DieselTokenTypes | GearboxToken | DieselStakedTokenTypes,
  DieselTokenData | GearboxTokenData | DieselStakedTokenData
> = {
  ...dieselTokens,
  ...dieselStakedTokens,
  GEAR: {
    name: "GEAR",
    symbol: "GEAR",
    type: { AllNetworks: TokenType.GEAR_TOKEN },
  },
};

export const isDieselToken = (t: unknown): t is DieselTokenTypes =>
  typeof t === "string" && !!dieselTokens[t as DieselTokenTypes];

export const isDieselSimpleToken = (t: unknown): t is DieselSimpleTokenTypes =>
  typeof t === "string" && !!dieselSimpleTokens[t as DieselSimpleTokenTypes];

export const isDieselWithStkToken = (
  t: unknown,
): t is DieselTokenWithStkTypes =>
  typeof t === "string" && !!dieselWithStkTokens[t as DieselTokenWithStkTypes];

export const isDieselStakedToken = (t: unknown): t is DieselStakedTokenTypes =>
  typeof t === "string" && !!dieselStakedTokens[t as DieselStakedTokenTypes];
