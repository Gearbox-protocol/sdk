import type { Asset } from "@gearbox-protocol/sdk";
import { PriceUtils } from "@gearbox-protocol/sdk/common-utils";
import type { Address } from "viem";
import type { TokenData } from "./types.js";

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
