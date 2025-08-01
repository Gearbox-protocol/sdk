import type { Address } from "viem";

import type { SupportedToken } from "../../sdk-gov-legacy/index.js";
import type { PartialRecord } from "../../utils/index.js";
import { GearboxBackendApi } from "../core/endpoint.js";
import type { TokenDataPayload } from "../payload/token.js";

const ALIASES: PartialRecord<SupportedToken, string> = {
  USDC_e: "USDC.e",
  dUSDC_eV3: "dUSDC.eV3",
  sdUSDC_eV3: "sdUSDC.eV3",
  sdWETHV3_OLD: "sdWETHV3 Old",

  PT_rsETH_26SEP2024: "p.rsETH(26.09.24)",
  PT_sUSDe_26DEC2024: "p.sUSDe(26.12.24)",
  PT_eETH_26DEC2024: "p.eETH(26.12.24)",
  PT_ezETH_26DEC2024: "p.ezETH(26.12.24)",
  PT_eBTC_26DEC2024: "p.eBTC(26.12.24)",
  PT_LBTC_27MAR2025: "p.LBTC(27.03.25)",

  PT_cornLBTC_26DEC2024: "p.c.LBTC(26.12.24)",
  PT_corn_eBTC_27MAR2025: "p.c.eBTC(27.03.25)",

  PT_corn_pumpBTC_26DEC2024: "p.c.pumpBTC(26.12.24)",

  PT_sUSDe_27MAR2025: "p.sUSDe(27.03.25)",

  PT_sUSDe_29MAY2025: "p.sUSDe(29.05.25)",

  PT_beraSTONE_10APR2025: "p.beraSTONE(10.04.25)",

  PT_uptBTC_14AUG2025: "p.uptBTC(14.08.25)",

  PT_sUSDX_1SEP2025: "p.sUSDX(1.09.25)",

  PT_sUSDf_25SEP2025: "p.sUSDf(1.09.25)",

  PT_USDf_29JAN2026: "p.USDf(29.01.26)",
};

export class TokenData {
  readonly address: Address;

  readonly title: string;
  readonly symbol: SupportedToken;
  readonly name: string;

  readonly decimals: number;
  readonly icon: string;

  constructor(payload: TokenDataPayload) {
    this.address = payload.addr.toLowerCase() as Address;

    this.title = ALIASES[payload.symbol] || payload.title || payload.symbol;
    this.symbol = payload.symbol;
    this.name = payload.name;

    this.decimals = payload.decimals;
    this.icon = TokenData.getTokenIcon(payload.symbol);
  }

  compareBySymbol(b: TokenData): number {
    return this.symbol > b.symbol ? 1 : -1;
  }

  static getTokenIcon(symbol: string): string {
    return `${GearboxBackendApi.getStaticTokenUrl()}${symbol.toLowerCase()}.svg`;
  }
}
