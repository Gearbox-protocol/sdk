import { PartialRecord, SupportedToken } from "@gearbox-protocol/sdk-gov";

import { STATIC_TOKEN } from "../config";
import { TokenDataPayload } from "../payload/token";

const ALIASES: PartialRecord<SupportedToken, string> = {
  USDC_e: "USDC.e",
};

export class TokenData {
  readonly title: string;
  readonly symbol: SupportedToken;
  readonly address: string;
  readonly decimals: number;
  readonly icon: string;

  constructor(payload: TokenDataPayload) {
    const symbol = payload.symbol;
    const title = payload.title || symbol;

    this.title = ALIASES[title as SupportedToken] || title;
    this.address = payload.addr.toLowerCase();
    this.symbol = symbol;
    this.decimals = payload.decimals;
    this.icon = `${STATIC_TOKEN}${symbol.toLowerCase()}.svg`;
  }

  compareBySymbol(b: TokenData): number {
    return this.symbol > b.symbol ? 1 : -1;
  }
}
