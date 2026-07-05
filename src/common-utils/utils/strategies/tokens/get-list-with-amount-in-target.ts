import type { Address } from "viem";
import type { Asset } from "../../../../sdk/index.js";
import type { TokenSlice } from "../strategy-info/types.js";
import { addAmountInTarget } from "./add-amount-in-target.js";
export interface AddAmountInTargetProps<T> {
  assets: Array<T>;
  targetToken: Address;
  prices: Record<Address, bigint>;
  tokensList: Record<Address, TokenSlice>;
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
