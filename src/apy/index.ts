import {
  isLPToken,
  LPTokens,
  PartialRecord,
  SupportedToken,
} from "@gearbox-protocol/sdk-gov";

type AdditionalTokensWithAPY = Extract<
  SupportedToken,
  "STETH" | "rETH" | "osETH" | "cbETH" | "wstETH" | "sfrxETH"
>;

type AdditionalLPTokens = Extract<
  SupportedToken,
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
>;

type ExtraFarmTokens = AdditionalTokensWithAPY | AdditionalLPTokens;
export type LRTAndLSDTokens = Extract<
  ExtraFarmTokens,
  | "weETH"
  | "rsETH"
  | "rswETH"
  | "pufETH"
  | "ezETH"
  | "STETH"
  | "wstETH"
  | "sfrxETH"
  | "osETH"
  | "cbETH"
  | "rETH"
>;

export type TokensWithAPY = LPTokens | AdditionalTokensWithAPY;
export type TokensWithApyRecord = PartialRecord<TokensWithAPY, number>;

export type AllLPTokens = LPTokens | ExtraFarmTokens;

const ADDITIONAL_LP_TOKENS: Record<AdditionalLPTokens, true> = {
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
};

const TOKENS_WITH_APY: Record<AdditionalTokensWithAPY, true> = {
  STETH: true,
  osETH: true,
  rETH: true,
  wstETH: true,
  cbETH: true,
  sfrxETH: true,
};

const LRT_LSD: Record<LRTAndLSDTokens, true> = {
  weETH: true,
  rsETH: true,
  rswETH: true,
  pufETH: true,
  ezETH: true,
  STETH: true,
  wstETH: true,
  sfrxETH: true,
  osETH: true,
  cbETH: true,
  rETH: true,
};

export const isLRT_LSDToken = (t: unknown): t is LRTAndLSDTokens => {
  if (typeof t !== "string") return false;
  return !!LRT_LSD[t as LRTAndLSDTokens];
};

export const isAdditionalLPToken = (t: unknown): t is AdditionalLPTokens => {
  if (typeof t !== "string") return false;
  return !!ADDITIONAL_LP_TOKENS[t as AdditionalLPTokens];
};

export const isAdditionalTokenWithAPY = (
  t: unknown,
): t is AdditionalTokensWithAPY => {
  if (typeof t !== "string") return false;
  return !!TOKENS_WITH_APY[t as AdditionalTokensWithAPY];
};

export const isExtraFarmToken = (t: unknown): t is ExtraFarmTokens =>
  isAdditionalLPToken(t) || isAdditionalTokenWithAPY(t);

export const isTokenWithAPY = (t: unknown): t is TokensWithAPY => {
  if (typeof t !== "string") return false;
  return isLPToken(t) || isAdditionalTokenWithAPY(t);
};

export const isFarmToken = (t: unknown): t is AllLPTokens => {
  return isLPToken(t) || isExtraFarmToken(t);
};

export * from "./convexAPY";
export * from "./curveAPY";
export * from "./defiLamaAPY";
export * from "./lidoAPY";
export * from "./yearnAPY";
