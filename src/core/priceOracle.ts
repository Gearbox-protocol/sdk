import { BigNumber, BigNumberish } from "ethers";

import { getDecimals } from "../tokens/token";

export interface PriceUpdate {
  token: string;
  price: BigNumberish;
}

export class PriceOracleData {
  protected _prices: Record<string, BigNumber> = {};

  constructor(prices: Array<PriceUpdate>) {
    this.updatePrices(prices);
  }

  updatePrices(prices: Array<PriceUpdate>) {
    prices.forEach(p => {
      this._prices[p.token.toLowerCase()] = BigNumber.from(p.price);
    });
  }

  convert(amount: BigNumber, from: string, to: string): BigNumber {
    return this.convertFromUSD(this.convertToUSD(amount, from), to);
  }

  convertFromUSD(amount: BigNumber, token: string): BigNumber {
    return amount
      .mul(BigNumber.from(10).pow(getDecimals(token)))
      .div(this.getPrice(token));
  }

  convertToUSD(amount: BigNumber, token: string): BigNumber {
    return amount
      .mul(this.getPrice(token))
      .div(BigNumber.from(10).pow(getDecimals(token)));
  }

  getPrice(token: string): BigNumber {
    const price = this._prices[token.toLowerCase()];
    if (!price) throw new Error(`Price for ${token} not found`);
    return price;
  }
}
