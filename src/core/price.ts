import { BigNumber } from "ethers";
import { WAD, PRICE_DECIMALS } from "./constants";

export const calcTotalPrice = (
  price: BigNumber,
  amount: BigNumber,
  decimals: number = 18
) =>
  amount
    .mul(WAD)
    .mul(price)
    .div(BigNumber.from(10).pow(decimals))
    .div(PRICE_DECIMALS);
