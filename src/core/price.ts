import { BigNumber } from "ethers";
import { WAD, PRICE_DECIMALS } from "../core/constants";

export const calcTotalPrice = (
  price: BigNumber,
  amount: BigNumber,
  decimals: number = 18
) => {
  return amount
    .mul(WAD)
    .mul(price)
    .div(BigNumber.from(10).pow(decimals))
    .div(PRICE_DECIMALS);
};
