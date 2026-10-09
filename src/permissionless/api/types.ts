import type { Transport } from "viem";
import type { GearboxAPIOptions } from "../../offchain/types.js";

/**
 * Options for creating a {@link GearboxPermissionless} instance.
 *
 * The same options {@link GearboxAPI} takes, since both clients read the same
 * backend, minus the chains: those the permissionless backend decides, and
 * {@link ChainsNamespace} reads that list and builds the clients from it.
 **/
export type GearboxPermissionlessOptions = Omit<
  GearboxAPIOptions,
  "chainIds"
> & {
  /**
   * Transports to reach chains directly through, by chain id.
   *
   * A chain named here is read over the transport given; one that is not
   * falls back to the public endpoints in its definition, which are rate
   * limited and will refuse a caller that reads at any volume. Anything
   * beyond a glance should pass its own.
   *
   * Which chains exist is still the backend's to decide — a transport for a
   * chain the backend does not serve is ignored, and naming no transport at
   * all leaves every chain reachable as before.
   **/
  transports?: Record<number, Transport>;
};
