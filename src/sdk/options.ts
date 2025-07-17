import { z } from "zod/v4";
import {
  PythOptions,
  RedstoneOptions,
} from "./market/pricefeeds/updates/index.js";
import type { PluginsMap } from "./plugins/index.js";
import type { ILogger } from "./types/index.js";
import { ZodAddress } from "./utils/index.js";

export const SDKOptions = z.object({
  /**
   * If not set, address provider address is determinted automatically from networkType
   */
  addressProvider: ZodAddress().optional(),
  /**
   * Market configurators
   */
  marketConfigurators: z.array(ZodAddress()).optional(),
  /**
   * Attach and load state at this specific block number
   */
  blockNumber: z
    .union([z.bigint().nonnegative(), z.number().int().nonnegative()])
    .optional(),
  /**
   * Will skip updateable prices on attach and sync
   * Makes things faster when your service is not intereseted in prices
   */
  ignoreUpdateablePrices: z.boolean().optional(),
  /**
   * Will skip loading markets for these pools on attach/hydrate/sync
   */
  ignoreMarkets: z.array(ZodAddress()).optional(),
  /**
   * Will throw an error if contract type is not supported, otherwise will try to use generic contract first, if possible
   */
  strictContractTypes: z.boolean().optional(),
  /**
   * Plugins to extends SDK functionality
   */
  plugins: z.record(z.string(), z.any()).optional(),
  /**
   * Bring your own logger
   */
  logger: z.any(),
  /**
   * Options related to redstone price feeds
   */
  redstone: RedstoneOptions.optional(),
  /**
   * Options related to pyth price feeds
   */
  pyth: PythOptions.optional(),
});

export type SDKOptions<Plugins extends PluginsMap> = Omit<
  z.infer<typeof SDKOptions>,
  "logger" | "plugins"
> & {
  /**
   * Plugins to extends SDK functionality
   */
  plugins?: Plugins;
  /**
   * Bring your own logger
   */
  logger?: ILogger;
};
