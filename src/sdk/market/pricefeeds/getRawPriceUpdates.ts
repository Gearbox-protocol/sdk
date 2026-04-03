import { decodeFunctionData, type Hex } from "viem";
import { iUpdatablePriceFeedAbi } from "../../../abi/iUpdatablePriceFeed.js";
import type { PriceUpdate, UpdatePriceFeedsResult } from "./types.js";

export function getRawPriceUpdates(
  updates: UpdatePriceFeedsResult,
): PriceUpdate[] {
  return updates.txs.map(tx => {
    const data = decodeFunctionData({
      abi: iUpdatablePriceFeedAbi,
      data: tx.raw.callData,
    });
    return {
      priceFeed: tx.raw.to,
      data: data.args[0] as Hex,
    };
  });
}
