import type { Address } from "viem";

import type { IPriceUpdateTx, RawTx } from "../../../types/index.js";
import type { IPriceFeedContract } from "../types.js";

export interface IPriceUpdateTask {
  dataFeedId: string;
  priceFeed: Address;
  timestamp: number;
  cached: boolean;
}

export interface IPriceUpdater<T extends IPriceUpdateTask = IPriceUpdateTask> {
  getUpdateTxs: (feeds: IPriceFeedContract[]) => Promise<IPriceUpdateTx<T>[]>;
  /**
   * Returns true if the updater is in historical mode
   */
  historical: boolean;
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

/**
 * Extended price feed interface for feeds whose price can be refreshed
 * via an off-chain data push.
 **/
export interface IUpdatablePriceFeedContract extends IPriceFeedContract {
  /**
   * Builds a raw transaction that pushes new price data to the on-chain feed.
   * @param data - ABI-encoded update payload.
   **/
  createPriceUpdateTx: (data: `0x${string}`) => RawTx;
}

/**
 * Result of generating price-feed update transactions.
 **/
export interface UpdatePriceFeedsResult {
  /**
   * Transactions that push fresh prices to updatable feeds.
   **/
  txs: IPriceUpdateTx[];
  /**
   * Latest timestamp among all fetched price updates (unix seconds).
   **/
  timestamp: number;
}

export type UpdatablePriceFeedRegistryHooks = {
  /**
   * Emitted when transactions to update price feeds have been generated, but before they're used anywhere
   */
  updatesGenerated: [UpdatePriceFeedsResult];
};

/**
 * @internal
 * Diagnostic snapshot of the most recent price-update round.
 **/
export interface LatestUpdate {
  /**
   * Unix timestamp (seconds) of the most recent update.
   **/
  timestamp: number;
  /**
   * Individual update tasks that were executed.
   **/
  updates: IPriceUpdateTask[];
}
