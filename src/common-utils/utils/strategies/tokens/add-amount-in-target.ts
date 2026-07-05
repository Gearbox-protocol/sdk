import type { Address } from "viem";
import type { Asset } from "../../../../sdk/index.js";
import { PriceUtils } from "../../price-math.js";
import type { TokenSlice } from "../strategy-info/types.js";
export function addAmountInTarget<T extends Asset>(
  asset: T,
  tokensList: Record<Address, TokenSlice>,
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
