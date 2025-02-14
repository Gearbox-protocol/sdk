import { PartialRecord, SupportedToken } from "@gearbox-protocol/sdk-gov";
import { Address } from "viem";

import { GearboxBackendApi } from "../core/endpoint";
import { TokenDataPayload } from "../payload/token";

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
};

export class TokenData {
  readonly title: string;
  readonly symbol: SupportedToken;
  readonly address: Address;
  readonly decimals: number;
  readonly icon: string;

  constructor(payload: TokenDataPayload) {
    const symbol = payload.symbol;

    this.title = ALIASES[symbol] || payload.title || symbol;
    this.address = payload.addr.toLowerCase() as Address;
    this.symbol = symbol;
    this.decimals = payload.decimals;
    this.icon = `${GearboxBackendApi.getStaticTokenUrl()}${symbol.toLowerCase()}.svg`;
  }

  compareBySymbol(b: TokenData): number {
    return this.symbol > b.symbol ? 1 : -1;
  }
}
