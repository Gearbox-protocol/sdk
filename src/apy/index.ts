import {
  isLPToken,
  LPTokens,
  PartialRecord,
  SupportedToken,
} from "@gearbox-protocol/sdk-gov";

// all extra tokens
type ExtraFarmTokens = Extract<
  SupportedToken,
  | "STETH"
  | "rETH"
  | "osETH"
  | "cbETH"
  | "wstETH"
  | "weETH"
  | "ezETH"
  | "sfrxETH"
  | "USDe"
  | "rsETH"
  | "rswETH"
  | "pufETH"
  | "pzETH"
  | "rstETH"
  | "steakLRT"
  | "amphrETH"
  | "LBTC"
  | "Re7LRT"
>;

// tokens with apy among them
type ExtraTokensWithAPY = Extract<
  ExtraFarmTokens,
  | "STETH"
  | "rETH"
  | "osETH"
  | "cbETH"
  | "wstETH"
  | "sfrxETH"
  | "pzETH"
  | "ezETH"
  | "Re7LRT"
  | "rsETH"
  | "weETH"
  | "rswETH"
  | "rstETH"
  | "steakLRT"
  | "amphrETH"
  | "pufETH"
>;

// LRT & LST tokens among them
type LRTAndLSTTokens = Exclude<ExtraFarmTokens, "USDe">;

const EXTRA_FARM_TOKENS: Record<ExtraFarmTokens, true> = {
  STETH: true,
  rETH: true,
  osETH: true,
  cbETH: true,
  wstETH: true,
  weETH: true,
  ezETH: true,
  sfrxETH: true,
  USDe: true,
  rsETH: true,
  rswETH: true,
  pufETH: true,
  pzETH: true,
  rstETH: true,
  steakLRT: true,
  amphrETH: true,
  LBTC: true,
  Re7LRT: true,
};

export const isExtraFarmToken = (t: unknown): t is ExtraFarmTokens => {
  if (typeof t !== "string") return false;
  return !!EXTRA_FARM_TOKENS[t as ExtraFarmTokens];
};

const EXTRA_TOKENS_WITH_APY: Record<ExtraTokensWithAPY, true> = {
  STETH: true,
  osETH: true,
  rETH: true,
  wstETH: true,
  cbETH: true,
  sfrxETH: true,

  pzETH: true,
  ezETH: true,
  Re7LRT: true,
  rsETH: true,
  weETH: true,
  rswETH: true,
  rstETH: true,
  steakLRT: true,
  amphrETH: true,
  pufETH: true,
};

const isExtraTokenWithAPY = (t: unknown): t is ExtraTokensWithAPY => {
  if (typeof t !== "string") return false;
  return !!EXTRA_TOKENS_WITH_APY[t as ExtraTokensWithAPY];
};

const { USDe, ...rest } = EXTRA_FARM_TOKENS;
const LRT_LST: Record<LRTAndLSTTokens, true> = rest;

export const isLRT_LSTToken = (t: unknown): t is LRTAndLSTTokens => {
  if (typeof t !== "string") return false;
  return !!LRT_LST[t as LRTAndLSTTokens];
};

export type TokensWithAPY = LPTokens | ExtraTokensWithAPY;
export type TokensWithApyRecord = PartialRecord<TokensWithAPY, number>;

export const isTokenWithAPY = (t: unknown): t is TokensWithAPY => {
  if (typeof t !== "string") return false;
  return isLPToken(t) || isExtraTokenWithAPY(t);
};

export type AllLPTokens = LPTokens | ExtraFarmTokens;

export const isFarmToken = (t: unknown): t is AllLPTokens => {
  return isLPToken(t) || isExtraFarmToken(t);
};

export * from "./convexAPY";
export * from "./curveAPY";
export * from "./defiLamaAPY";
export * from "./lidoAPY";
export * from "./yearnAPY";
