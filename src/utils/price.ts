import { BigNumber } from "ethers";
import { WAD, PRICE_DECIMALS } from "../core/constants";

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

interface Target {
  price: BigNumber;
  decimals: number | undefined;
}

export function convertByPrice(
  totalMoney: BigNumber,
  { price: targetPrice, decimals: targetDecimals = 18 }: Target
) {
  const isWrongTargetPrice = targetPrice.isZero() || targetPrice.isNegative();

  return isWrongTargetPrice
    ? BigNumber.from(0)
    : totalMoney
        .mul(BigNumber.from(10).pow(targetDecimals))
        .mul(PRICE_DECIMALS)
        .div(targetPrice)
        .div(WAD);
}
