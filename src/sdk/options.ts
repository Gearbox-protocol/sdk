import { z } from "zod/v4";
import {
  PythOptions,
  RedstoneOptions,
} from "./market/pricefeeds/updates/index.js";
import type { PluginsMap } from "./plugins/index.js";
import type { ILogger } from "./types/index.js";
import { ZodAddress } from "./utils/index.js";

/**
 * Zod schema for validating {@link OnchainSDKOptions} at runtime.
 **/
export const OnchainSDKOptionsSchema = z.object({
  /** When `true`, throw on unrecognised contract types. */
  strictContractTypes: z.boolean().optional(),
  /** Plugins that extend SDK functionality. */
  plugins: z.record(z.string(), z.any()).optional(),
  /** Custom logger implementation. */
  logger: z.any(),
  /**
   * Explicit gas limit for read-only `eth_call` requests.
   * `null` disables the gas limit entirely; `undefined` uses the SDK default.
   * Default to value from {@link GearboxChain.gasLimit}
   **/
  gasLimit: z.bigint().nonnegative().nullable().optional(),
});

/**
 * Zod schema for validating {@link AttachOptions} at runtime.
 **/
export const AttachOptionsSchema = z.object({
  /** Override address of the Gearbox AddressProvider contract. */
  addressProvider: ZodAddress().optional(),
  /** Addresses of market configurator contracts to load. */
  marketConfigurators: z.array(ZodAddress()).optional(),
  /**
   * Addresses of RWA factory contracts to load.
   * If not set, all default RWA factories for the chain are loaded
   * (from {@link GearboxChain.rwaFactories})
   **/
  rwaFactories: z.array(ZodAddress()).optional(),
  /** Pin SDK to a specific block number during attach. */
  blockNumber: z
    .union([z.bigint().nonnegative(), z.number().int().nonnegative()])
    .optional(),
  /** Skip fetching updatable price feeds on attach and sync. */
  ignoreUpdateablePrices: z.boolean().optional(),
  /** Pool addresses whose markets should be skipped. */
  ignoreMarkets: z.array(ZodAddress()).optional(),
  /** Options for Redstone price-feed updates. */
  redstone: RedstoneOptions.optional(),
  /** Options for Pyth price-feed updates. */
  pyth: PythOptions.optional(),
});

/**
 * SDK constructor options type.
 *
 * @typeParam Plugins - Map of plugin names to plugin instances.
 **/
export type SDKOptions<Plugins extends PluginsMap> = Omit<
  z.infer<typeof OnchainSDKOptionsSchema>,
  "logger" | "plugins"
> & {
  /** Plugins that extend SDK functionality. */
  plugins?: Plugins;
  /** Custom logger implementation. */
  logger?: ILogger;
};
