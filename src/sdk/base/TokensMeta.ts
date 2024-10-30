import type { Address } from "viem";

import type { Asset } from "../router";
import { AddressMap, formatBN } from "../utils";
import type { TokenMetaData } from "./types";

export class TokensMeta extends AddressMap<TokenMetaData> {
  public symbol(token: Address): string {
    return this.mustGet(token).symbol;
  }

  public decimals(token: Address): number {
    return this.mustGet(token).decimals;
  }

  public formatBN(asset: Asset, precision?: number): string;
  public formatBN(
    token: Address,
    amount: number | bigint | string | undefined,
    precision?: number,
  ): string;
  public formatBN(
    arg0: Asset | Address,
    arg1: number | bigint | string | undefined,
    arg2?: number,
  ): string {
    const token = typeof arg0 === "object" ? arg0.token : arg0;
    const amount = typeof arg0 === "object" ? arg0.balance : arg1;
    const precision =
      typeof arg0 === "object" ? (arg1 as number | undefined) : arg2;
    return formatBN(amount, this.decimals(token), precision);
  }

  public findBySymbol(symbol: string): TokenMetaData | undefined {
    return this.values().find(v => v.symbol === symbol);
  }

  public mustFindBySymbol(symbol: string): TokenMetaData {
    const meta = this.findBySymbol(symbol);
    if (!meta) {
      throw new Error(`cannot find token meta for symbol '${symbol}'`);
    }
    return meta;
  }
}
