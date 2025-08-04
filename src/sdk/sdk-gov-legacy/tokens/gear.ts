import type { TokenBase } from "./token.js";
import type { TokenNetwork } from "./tokenType.js";
import { TokenType } from "./tokenType.js";

export type DieselSimpleTokenTypes =
  | "dDAI"
  | "dUSDC"
  | "dWBTC"
  | "dWETH"
  | "dwstETH"
  | "dFRAX"
  | "dDOLAV3"
  | "dtBTCV3"
  | "dwstETHV3"
  | "dwSV3"
  | "dUSDTv310"
  | "dWBNBv3"
  | "dUSD1V3";

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
