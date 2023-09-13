import { STATIC_TOKEN } from "../config";
import { TokenDataPayload } from "../payload/token";

export class TokenData {
  readonly id: string;
  readonly symbol: string;
  readonly address: string;
  readonly decimals: number;
  readonly icon?: string;

  constructor(
    payload: TokenDataPayload,
    symbolReplacements: Record<string, string> = {},
  ) {
    this.id = payload.addr.toLowerCase();
    this.address = payload.addr.toLowerCase();
    this.symbol = symbolReplacements[payload.symbol] || payload.symbol;
    this.decimals = payload.decimals;
    this.icon = `${STATIC_TOKEN}${payload.symbol?.toLowerCase()}.svg`;
  }

  compareBySymbol(b: TokenData): number {
    return this.symbol > b.symbol ? 1 : -1;
  }
}
