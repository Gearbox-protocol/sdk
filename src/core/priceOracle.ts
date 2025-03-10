import { getDecimals, toBigInt } from "@gearbox-protocol/sdk-gov";

import type { BigNumberish } from "../utils/formatter";

export interface PriceUpdate {
  token: string;
  price: BigNumberish;
}

export class PriceOracleData {
  protected _prices: Record<string, bigint> = {};

  constructor(prices: Array<PriceUpdate>) {
    this.updatePrices(prices);
  }

  updatePrices(prices: Array<PriceUpdate>) {
    prices.forEach(p => {
      this._prices[p.token.toLowerCase()] = toBigInt(p.price);
    });
  }

  convert(amount: bigint, from: string, to: string): bigint {
    return this.convertFromUSD(this.convertToUSD(amount, from), to);
  }

  convertFromUSD(amount: bigint, token: string): bigint {
    return (amount * 10n ** BigInt(getDecimals(token))) / this.getPrice(token);
  }

  convertToUSD(amount: bigint, token: string): bigint {
    return (amount * this.getPrice(token)) / 10n ** BigInt(getDecimals(token));
  }

  getPrice(token: string): bigint {
    const price = this._prices[token.toLowerCase()];
    if (price === undefined) throw new Error(`Price for ${token} not found`);
    return price;
  }
}
