import type { Address } from "viem";
import type { ChainId } from "../model/primitives.js";
import type { ILogger } from "../onchain/types/logger.js";

/** Trusted signer endpoints for one market configurator. */
export interface OpeningSignerRegistry {
  chainId: ChainId;
  marketConfigurator: Address;
  signers: readonly { address: Address; url: string }[];
}

/**
 * Options for creating a {@link GearboxAPI} instance.
 **/
export interface GearboxAPIOptions {
  /**
   * Chains this client reads, which every request names. A caller who thinks in
   * network labels converts with {@link toChainIds}.
   **/
  chainIds: ChainId[];
  /** Overrides the SDK signer registry. An empty list disables all signer endpoints. */
  openingSignerRegistries?: readonly OpeningSignerRegistry[];
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
