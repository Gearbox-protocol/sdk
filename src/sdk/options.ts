import { z } from "zod/v4";
import {
  PythOptions,
  RedstoneOptions,
} from "./market/pricefeeds/updates/index.js";
import type { PluginsMap } from "./plugins/index.js";
import type { ILogger } from "./types/index.js";
import { ZodAddress } from "./utils/index.js";

/**
 * Zod schema for validating {@link SDKOptions} at runtime.
 **/
export const SDKOptions = z.object({
  /**
   * Override address of the Gearbox AddressProvider contract.
   * If not set, uses default universal address provider address {@link ADDRESS_PROVIDER_V310}
   **/
  addressProvider: ZodAddress().optional(),
  /**
   * Addresses of market configurator contracts to load.
   * If not set, all default market configurators for the chain are loaded
   * (from {@link GearboxChain.defaultMarketConfigurators})
   **/
  marketConfigurators: z.array(ZodAddress()).optional(),
  /**
   * Pin SDK to a specific block number during attach.
   * When set, all on-chain reads use this block instead of `latest`.
   **/
  blockNumber: z
    .union([z.bigint().nonnegative(), z.number().int().nonnegative()])
    .optional(),
  /**
   * Skip fetching updatable price feeds on attach and sync.
   * Speeds up initialisation when prices are not needed.
   **/
  ignoreUpdateablePrices: z.boolean().optional(),
  /**
   * Pool addresses whose markets should be skipped during attach/hydrate/sync.
   **/
  ignoreMarkets: z.array(ZodAddress()).optional(),
  /**
   * When `true`, throw on unrecognised contract types instead of falling
   * back to a generic contract wrapper.
   **/
  strictContractTypes: z.boolean().optional(),
  /**
   * Plugins that extend SDK functionality.
   **/
  plugins: z.record(z.string(), z.any()).optional(),
  /**
   * Custom logger implementation.
   **/
  logger: z.any(),
  /**
   * Options for Redstone price-feed updates.
   **/
  redstone: RedstoneOptions.optional(),
  /**
   * Options for Pyth price-feed updates.
   **/
  pyth: PythOptions.optional(),
  /**
   * Explicit gas limit for read-only `eth_call` requests.
   * `null` disables the gas limit entirely; `undefined` uses the SDK default.
   * Default to value from {@link GearboxChain.gasLimit}
   **/
  gasLimit: z.bigint().nonnegative().nullable().optional(),
});

/**
 * Configuration options accepted by {@link GearboxSDK.attach} and related
 * factory methods.
 *
 * @typeParam Plugins - Map of plugin names to plugin instances.
 **/
export type SDKOptions<Plugins extends PluginsMap> = Omit<
  z.infer<typeof SDKOptions>,
  "logger" | "plugins"
> & {
  /**
   * Plugins that extend SDK functionality.
   **/
  plugins?: Plugins;
  /**
   * Custom logger implementation.
   **/
  logger?: ILogger;
};
