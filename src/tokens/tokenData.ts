import { PartialRecord, SupportedToken } from "@gearbox-protocol/sdk-gov";
import { Address } from "viem";

import { GearboxBackendApi } from "../core/endpoint";
import { TokenDataPayload } from "../payload/token";

const ALIASES: PartialRecord<SupportedToken, string> = {
  USDC_e: "USDC.e",
  dUSDC_eV3: "dUSDC.eV3",
  sdUSDC_eV3: "sdUSDC.eV3",
  sdWETHV3_OLD: "sdWETHV3 Old",
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
