import type { Asset } from "@gearbox-protocol/sdk";
import type { Address } from "viem";
import { addAmountInTarget } from "./add-amount-in-target.js";
import type { TokenData } from "./types.js";

export interface AddAmountInTargetProps<T> {
  assets: Array<T>;
  targetToken: Address;
  prices: Record<Address, bigint>;
  tokensList: Record<Address, TokenData>;
}

export function getListWithAmountInTarget<T extends Asset>({
  assets,
  targetToken,
  prices,
  tokensList,
}: AddAmountInTargetProps<T>): Array<
  T & {
    amountInTarget: bigint;
  }
> {
  const { decimals: toDecimals = 18 } = tokensList[targetToken] || {};
  const toPrice = prices[targetToken] || 0n;

  const withAmount = assets.map(asset => {
    const a = addAmountInTarget(asset, tokensList, prices, toPrice, toDecimals);
    return a;
  });

  return withAmount;
}
