import { z } from "zod/v4";
import { SDKConstruct } from "../../../base/index.js";
import type { GearboxSDK } from "../../../GearboxSDK.js";
import type { IPriceUpdateTx } from "../../../types/index.js";
import type { IPriceFeedContract } from "../types.js";
import type { IPriceUpdater, IPriceUpdateTask } from "./types.js";

interface RedstoneUpdateTask extends IPriceUpdateTask {
  dataServiceId: string;
}

/** @deprecated RedStone options are accepted for compatibility and ignored. */
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
   * When true, no error will be thrown when redstone is unable to fetch data for some feeds
   */
  ignoreMissingFeeds: z.boolean().optional(),
  /**
   * Enable redstone internal logging
   */
  enableLogging: z.boolean().optional(),
});

export type RedstoneOptions = z.infer<typeof RedstoneOptions>;
/** @deprecated RedStone updates are no longer supported. */
export class RedstoneUpdater
  extends SDKConstruct
  implements IPriceUpdater<RedstoneUpdateTask>
{
  constructor(sdk: GearboxSDK, _opts: RedstoneOptions = {}) {
    super(sdk);
  }

  public async getUpdateTxs(
    _feeds: IPriceFeedContract[],
  ): Promise<IPriceUpdateTx<RedstoneUpdateTask>[]> {
    return [];
  }
}
