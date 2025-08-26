import { decodeFunctionData, type Hex } from "viem";
import { iUpdatablePriceFeedAbi } from "../../../abi/iUpdatablePriceFeed.js";
import type { PriceUpdateV310, UpdatePriceFeedsResult } from "./types.js";

export function getRawPriceUpdates(
  updates: UpdatePriceFeedsResult,
): PriceUpdateV310[] {
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
