import { PRICE_DECIMALS, WAD } from "../../constants";

interface Target {
  price: bigint;
  decimals: number | undefined;
}

export class PriceUtils {
  static calcTotalPrice = (
    price: bigint,
    amount: bigint,
    decimals: number | undefined = 18,
  ): bigint =>
    (amount * WAD * price) / 10n ** BigInt(decimals) / PRICE_DECIMALS;

  static convertByPrice(
    totalMoney: bigint,
    { price: targetPrice, decimals: targetDecimals = 18 }: Target,
  ): bigint {
    if (targetPrice <= 0n) return 0n;
    return (
      (totalMoney * 10n ** BigInt(targetDecimals) * PRICE_DECIMALS) /
      targetPrice /
      WAD
    );
  }
}
