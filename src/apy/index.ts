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
  "weETH" | "ezETH" | "sfrxETH" | "USDe" | "rsETH" | "rswETH" | "pufETH"
>;

const ADDITIONAL_LP_TOKENS: Record<AdditionalLPTokens, true> = {
  weETH: true,
  ezETH: true,
  sfrxETH: true,
  USDe: true,
  rsETH: true,
  rswETH: true,
  pufETH: true,
};

const TOKENS_WITH_APY: Record<AdditionalTokensWithAPY, true> = {
  STETH: true,
  osETH: true,
  rETH: true,
  wstETH: true,
  cbETH: true,
  sfrxETH: true,
};

export const isAdditionalLPToken = (t: unknown): t is AdditionalLPTokens => {
  if (typeof t !== "string") return false;
  return !!ADDITIONAL_LP_TOKENS[t as AdditionalLPTokens];
};

export type TokensWithAPY = LPTokens | AdditionalTokensWithAPY;
export type TokensWithApyRecord = PartialRecord<TokensWithAPY, number>;

export const isAdditionalTokenWithAPY = (
  t: unknown,
): t is AdditionalTokensWithAPY => {
  if (typeof t !== "string") return false;
  return !!TOKENS_WITH_APY[t as AdditionalTokensWithAPY];
};

export const isExtraFarmToken = (t: unknown) =>
  isAdditionalLPToken(t) || isAdditionalTokenWithAPY(t);

export const isTokenWithAPY = (t: unknown): t is TokensWithAPY => {
  if (typeof t !== "string") return false;
  return isLPToken(t) || isAdditionalTokenWithAPY(t);
};

export type AllLPTokens =
  | LPTokens
  | AdditionalLPTokens
  | AdditionalTokensWithAPY;

export const isFarmToken = (t: unknown): t is AllLPTokens => {
  return isLPToken(t) || isExtraFarmToken(t);
};

export * from "./convexAPY";
export * from "./curveAPY";
export * from "./defiLamaAPY";
export * from "./lidoAPY";
export * from "./yearnAPY";
