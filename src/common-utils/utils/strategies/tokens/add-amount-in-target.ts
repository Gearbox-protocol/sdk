import type { Address } from "viem";
import type { Asset } from "../../../../sdk/router/types.js";
import type { TokenData } from "../../../charts/token-data.js";
import { PriceUtils } from "../../price-math.js";
export function addAmountInTarget<T extends Asset>(
  asset: T,
  tokensList: Record<Address, TokenData>,
  prices: Record<Address, bigint>,
  toPrice: bigint,
  toDecimals: number,
): T & { amountInTarget: bigint } {
  const { balance: fromAmount, token: fromToken } = asset;
  const { decimals: fromDecimals = 18, address: fromAddress } =
    tokensList[fromToken] || {};
  const fromPrice = prices[fromAddress] || 0n;

  const inTarget = PriceUtils.convertByPrice(
    PriceUtils.calcTotalPrice(fromPrice, fromAmount, fromDecimals),
    {
      price: toPrice,
      decimals: toDecimals,
    },
  );

  return { ...asset, amountInTarget: inTarget };
}
