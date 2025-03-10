import type { Address } from "viem";

import type { LPTokens, SupportedToken } from "../../sdk-gov-legacy";
import { isLPToken } from "../../sdk-gov-legacy";
import type { PartialRecord } from "../../utils";

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
  | "PT_ezETH_26DEC2024"
  | "PT_eETH_26DEC2024"
  | "PT_sUSDe_26DEC2024"
  | "PT_eBTC_26DEC2024"
  | "PT_LBTC_27MAR2025"
  | "eBTC"
  | "PT_cornLBTC_26DEC2024"
  | "PT_corn_eBTC_27MAR2025"
  | "PT_corn_pumpBTC_26DEC2024"
  | "pumpBTC"
  | "PT_sUSDe_27MAR2025"
  | "DVstETH"
  | "beraSTONE"
  | "PT_sUSDe_29MAY2025"
  | "tETH"
  | "PT_beraSTONE_10APR2025"
  | "stS"
  | "csUSDL"
  | "scUSD"
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
  | "PT_ezETH_26DEC2024"
  | "PT_eETH_26DEC2024"
  | "PT_sUSDe_26DEC2024"
  | "PT_eBTC_26DEC2024"
  | "PT_LBTC_27MAR2025"
  | "PT_cornLBTC_26DEC2024"
  | "PT_corn_eBTC_27MAR2025"
  | "PT_corn_pumpBTC_26DEC2024"
  | "PT_sUSDe_27MAR2025"
  | "DVstETH"
  | "PT_sUSDe_29MAY2025"
  | "tETH"
  | "PT_beraSTONE_10APR2025"
  | "stS"
  | "csUSDL"
  | "scUSD"
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
  PT_ezETH_26DEC2024: true,
  PT_eETH_26DEC2024: true,
  PT_sUSDe_26DEC2024: true,
  PT_eBTC_26DEC2024: true,
  PT_LBTC_27MAR2025: true,
  eBTC: true,
  PT_cornLBTC_26DEC2024: true,
  PT_corn_eBTC_27MAR2025: true,
  PT_corn_pumpBTC_26DEC2024: true,
  pumpBTC: true,
  PT_sUSDe_27MAR2025: true,
  DVstETH: true,
  beraSTONE: true,
  PT_sUSDe_29MAY2025: true,
  tETH: true,
  PT_beraSTONE_10APR2025: true,
  stS: true,
  csUSDL: true,
  scUSD: true,
};

export const isExtraFarmToken = (t: unknown): t is ExtraFarmTokens => {
  if (typeof t !== "string") return false;
  return !!EXTRA_FARM_TOKENS[t as ExtraFarmTokens];
};

const { USDe, ...rest } = EXTRA_FARM_TOKENS;
const LRT_LST: Record<LRTAndLSTTokens, true> = rest;

export const isLRT_LSTToken = (t: unknown): t is LRTAndLSTTokens => {
  if (typeof t !== "string") return false;
  return !!LRT_LST[t as LRTAndLSTTokens];
};

export type TokensWithAPY = LPTokens | ExtraTokensWithAPY;
export type TokensAPYList = PartialRecord<Address, number>;

export type AllLPTokens = LPTokens | ExtraFarmTokens;

export const isFarmToken = (t: unknown): t is AllLPTokens => {
  return isLPToken(t) || isExtraFarmToken(t);
};
