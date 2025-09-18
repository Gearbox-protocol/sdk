import type { Address } from "viem";

import type { Asset } from "../router/index.js";
import { AddressMap, formatBN } from "../utils/index.js";
import type { TokenMetaData } from "./types.js";

export interface FormatBNOptions {
  precision?: number;
  symbol?: boolean;
}

export class TokensMeta extends AddressMap<TokenMetaData> {
  public symbol(token: Address): string {
    return this.mustGet(token).symbol;
  }

  public decimals(token: Address): number {
    return this.mustGet(token).decimals;
  }

  public formatBN(asset: Asset, options?: FormatBNOptions): string;
  public formatBN(
    token: Address,
    amount: number | bigint | string | undefined,
    options?: FormatBNOptions,
  ): string;
  public formatBN(
    arg0: Asset | Address,
    arg1: number | bigint | string | FormatBNOptions | undefined,
    arg2?: FormatBNOptions,
  ): string {
    const token = typeof arg0 === "object" ? arg0.token : arg0;
    const amount =
      typeof arg0 === "object"
        ? arg0.balance
        : (arg1 as number | bigint | string | undefined);
    const options =
      typeof arg0 === "object" ? (arg1 as FormatBNOptions | undefined) : arg2;
    const { precision, symbol } = options ?? {};
    const asStr = formatBN(amount, this.decimals(token), precision);
    return symbol ? `${asStr} ${this.symbol(token)}` : asStr;
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
