import { BigNumber } from "ethers";
import { TokenData } from "../tokens/tokenData";

export const PRICE_DECIMALS = 1000;

export const priceCalc = (
  price: number,
  amount: BigNumber,
  token: TokenData | undefined
) => {
  const { decimals = 18 } = token || {};

  return amount
    .mul(Math.floor(PRICE_DECIMALS * price))
    .div(BigNumber.from(10).pow(decimals));
};
