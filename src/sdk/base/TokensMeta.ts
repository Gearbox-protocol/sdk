import type { Address } from "viem";

import { AddressMap } from "../utils";
import type { TokenMetaData } from "./types";

export class TokensMeta extends AddressMap<TokenMetaData> {
  public symbol(token: Address): string {
    return this.mustGet(token).symbol;
  }

  public decimals(token: Address): number {
    return this.mustGet(token).decimals;
  }

  public findBySymbol(symbol: string): TokenMetaData | undefined {
    return this.values().find(v => v.symbol === symbol);
  }
}
