import type { Address } from "viem";

import type { IPriceUpdateTx } from "../../../types/index.js";
import type { IPriceFeedContract } from "../types.js";

export interface IPriceUpdateTask {
  dataFeedId: string;
  priceFeed: Address;
  timestamp: number;
  cached: boolean;
}

export interface IPriceUpdater<T extends IPriceUpdateTask = IPriceUpdateTask> {
  getUpdateTxs: (feeds: IPriceFeedContract[]) => Promise<IPriceUpdateTx<T>[]>;
}

export interface TimestampedCalldata {
  dataFeedId: string;
  data: `0x${string}`;
  /**
   * This timestamp is in seconds
   */
  timestamp: number;
  cached: boolean;
}
