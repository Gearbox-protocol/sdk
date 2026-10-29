import { z } from "zod/v4";
import { SDKConstruct } from "../../../base/index.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import type { IPriceFeedContract } from "../types.js";
import type { PriceUpdatesCache } from "./PriceUpdatesCache.js";
import { PriceUpdateTx } from "./PriceUpdateTx.js";
import type { IPriceUpdater, IPriceUpdateTask } from "./types.js";

export type PythUpdateTask = IPriceUpdateTask;

class PythUpdateTx extends PriceUpdateTx<PythUpdateTask> {
  public readonly name = "pyth";
}

/** @deprecated Options are accepted for compatibility and ignored. */
export const PythOptions = z.object({
  /**
   * Fixed pyth historic timestamp in seconds
   * Set to true to enable pyth historical mode using timestamp from attach block
   */
  historicTimestamp: z
    .union([z.number().nonnegative(), z.literal(true)])
    .optional(),
  /**
   * Override Hermes API with this proxy. Can be used to set caching proxies, to avoid rate limiting
   */
  apiProxy: z.url().optional(),
  /**
   * TTL for pyth cache in milliseconds
   * If 0, disables caching
   * If not set, uses some default value
   * Cache is always enabled in historical mode
   */
  cacheTTL: z.number().nonnegative().optional(),
  /**
   * When true, an error will be thrown when pyth is unable to fetch data for some feeds
   */
  failOnMissingFeeds: z.boolean().optional(),
});

export type PythOptions = z.infer<typeof PythOptions> & {
  /** Shared cache injected by {@link MultichainSDK} to avoid redundant fetches. */
  cache?: PriceUpdatesCache;
};

/** @deprecated Pyth updates are no longer supported. */
export class PythUpdater
  extends SDKConstruct
  implements IPriceUpdater<PythUpdateTask>
{
  constructor(sdk: OnchainSDK, _opts: PythOptions = {}) {
    super(sdk);
  }

  public async getUpdateTxs(
    _feeds: IPriceFeedContract[],
  ): Promise<PythUpdateTx[]> {
    return [];
  }

  public get historical(): boolean {
    return false;
  }
}
