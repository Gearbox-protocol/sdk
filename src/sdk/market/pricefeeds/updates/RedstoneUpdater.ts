import { z } from "zod/v4";
import { SDKConstruct } from "../../../base/index.js";
import type { OnchainSDK } from "../../../OnchainSDK.js";
import type { IPriceFeedContract } from "../types.js";
import type { PriceUpdatesCache } from "./PriceUpdatesCache.js";
import { PriceUpdateTx } from "./PriceUpdateTx.js";
import type { IPriceUpdater, IPriceUpdateTask } from "./types.js";

interface RedstoneUpdateTask extends IPriceUpdateTask {
  dataServiceId: string;
}

class RedstoneUpdateTx extends PriceUpdateTx<RedstoneUpdateTask> {
  public readonly name = "redstone";
}

/** @deprecated Options are accepted for compatibility and ignored. */
export const RedstoneOptions = z.object({
  /**
   * Fixed redstone historic timestamp in ms
   * Set to true to enable redstone historical mode using timestamp from attach block
   */
  historicTimestamp: z
    .union([z.number().nonnegative(), z.literal(true)])
    .optional(),
  /**
   * Override redstone gateways. Can be used to set caching proxies, to avoid rate limiting
   */
  gateways: z.array(z.url()).optional(),
  /**
   * TTL for redstone cache in milliseconds
   * If 0, disables caching
   * If not set, uses some default value
   * Cache is always enabled in historical mode
   */
  cacheTTL: z.number().nonnegative().optional(),
  /**
   * When true, an error will be thrown when redstone is unable to fetch data for some feeds
   */
  failOnMissingFeeds: z.boolean().optional(),
  /**
   * Enable redstone internal logging
   */
  enableLogging: z.boolean().optional(),
});

export type RedstoneOptions = z.infer<typeof RedstoneOptions> & {
  cache?: PriceUpdatesCache;
};

/** @deprecated Redstone updates are no longer supported. */
export class RedstoneUpdater
  extends SDKConstruct
  implements IPriceUpdater<RedstoneUpdateTask>
{
  constructor(sdk: OnchainSDK, _opts: RedstoneOptions = {}) {
    super(sdk);
  }

  public async getUpdateTxs(
    _feeds: IPriceFeedContract[],
  ): Promise<RedstoneUpdateTx[]> {
    return [];
  }

  public get historical(): boolean {
    return false;
  }
}
