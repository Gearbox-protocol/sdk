import { BigNumber } from "ethers";

export const calcTotalPrice = (
  price: BigNumber,
  amount: BigNumber,
  decimals: number = 18
) => {
  return amount.mul(price).div(BigNumber.from(10).pow(decimals));
};
