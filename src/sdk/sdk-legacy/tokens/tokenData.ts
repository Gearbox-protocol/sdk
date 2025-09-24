import type { Address } from "viem";

import type { SupportedToken } from "../../sdk-gov-legacy/index.js";
import type { PartialRecord } from "../../utils/index.js";
import { GearboxBackendApi } from "../core/endpoint.js";

export interface TokenDataPayload {
  addr: Address;

  // token real symbol
  symbol: SupportedToken;
  // token human-readable symbol
  title?: string;
  // token full name
  name: string;

  decimals: number;
}

// UPDATE ME
const HUMAN_READABLE_TITLES: PartialRecord<string, string> = {
  USDC_e: "USDC.e",
  dUSDC_eV3: "dUSDC.eV3",
  sdUSDC_eV3: "sdUSDC.eV3",
  sdWETHV3_OLD: "sdWETHV3 Old",

  PT_rsETH_26SEP2024: "pt.rsETH(26.09.24)",
  PT_sUSDe_26DEC2024: "pt.sUSDe(26.12.24)",
  PT_eETH_26DEC2024: "pt.eETH(26.12.24)",
  PT_ezETH_26DEC2024: "pt.ezETH(26.12.24)",
  PT_eBTC_26DEC2024: "pt.eBTC(26.12.24)",
  PT_LBTC_27MAR2025: "pt.LBTC(27.03.25)",

  PT_cornLBTC_26DEC2024: "pt.c.LBTC(26.12.24)",
  PT_corn_eBTC_27MAR2025: "pt.c.eBTC(27.03.25)",

  PT_corn_pumpBTC_26DEC2024: "pt.c.pumpBTC(26.12.24)",

  PT_sUSDe_27MAR2025: "pt.sUSDe(27.03.25)",

  PT_sUSDe_29MAY2025: "pt.sUSDe(29.05.25)",

  PT_beraSTONE_10APR2025: "pt.beraSTONE(10.04.25)",

  PT_uptBTC_14AUG2025: "pt.uptBTC(14.08.25)",

  PT_sUSDX_1SEP2025: "pt.sUSDX(1.09.25)",

  PT_sUSDf_25SEP2025: "pt.sUSDf(25.09.25)",
  ["PT-sUSDf-29JAN2026"]: "pt.sUSDf(29.01.26)",

  PT_USDf_29JAN2026: "pt.USDf(29.01.26)",

  stkcvxllamathena_v3_1: "stkcvxllamathena",
  stkcvxRLUSDUSDC_v3_1: "stkcvxRLUSDUSDC",

  "PT-wstUSR-25SEP2025": "pt.wstUSR(25.09.25)",
  "PT-yUSD-27NOV2025": "pt.yUSD(27.11.25)",
  "PT-pUSDe-16OCT2025": "pt.pUSDe(16.10.25)",

  "0xab7d50fc2486a1ac06516e2ece9dadc95ba8cd20": "cp0xLRT\u00A0→\u00A0wstETH",
  "0x6252467c2fefb61cb55180282943139baeea36c5": "cp0xLRT\u00A0→\u00A0wstETH",
};

export class TokenData {
  readonly address: Address;

  readonly title: string;
  readonly symbol: SupportedToken;
  readonly name: string;

  readonly decimals: number;
  readonly icon: string;

  constructor(payload: TokenDataPayload) {
    const address = payload.addr.toLowerCase() as Address;
    this.address = address;

    this.title =
      payload.title ||
      HUMAN_READABLE_TITLES[payload.symbol] ||
      HUMAN_READABLE_TITLES[address] ||
      payload.symbol;
    this.symbol = payload.symbol;
    this.name = payload.name;

    this.decimals = payload.decimals;
    this.icon = TokenData.getTokenIcon(payload.symbol);
  }

  static getTokenIcon(symbol: string): string {
    return `${GearboxBackendApi.getStaticTokenUrl()}${symbol.toLowerCase()}.svg`;
  }
}
