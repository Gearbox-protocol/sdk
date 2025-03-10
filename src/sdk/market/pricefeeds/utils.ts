import { decodeFunctionData } from "viem";

import { iUpdatablePriceFeedAbi } from "../../../abi/iUpdatablePriceFeed.js";
import type { RawTx } from "../../types/index.js";

/**
 * Helper method to convert our RawTx into viem's multicall format
 * Involves decoding what was previously encoded, but it's better than adding another method to PriceOracle
 * @param tx
 * @returns
 */
export function rawTxToMulticallPriceUpdate(tx: RawTx) {
  const { to, callData } = tx;
  const { args, functionName } = decodeFunctionData({
    abi: iUpdatablePriceFeedAbi,
    data: callData,
  });
  return {
    abi: iUpdatablePriceFeedAbi,
    address: to,
    functionName,
    args,
  };
}
