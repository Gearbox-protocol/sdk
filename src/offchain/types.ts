import type { ChainId } from "../model/primitives.js";
import type { ILogger } from "../sdk/types/logger.js";

/**
 * Options for creating a {@link GearboxAPI} instance.
 **/
export interface GearboxAPIOptions {
  /**
   * Chains this client reads, which every request names. A caller who thinks in
   * network labels converts with {@link toChainIds}.
   **/
  chainIds: ChainId[];
  /**
   * Base URL of the Gearbox backend, without a trailing slash.
   *
   * @example `"https://api.gearbox.fi"`
   **/
  baseUrl?: string;
  /**
   * How long a single request may take, in milliseconds.
   *
   * @defaultValue 30 seconds
   **/
  timeout?: number;
  logger?: ILogger;
}
