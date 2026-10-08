import type { GearboxAPIOptions } from "../../offchain/types.js";

/**
 * Options for creating a {@link GearboxPermissionless} instance.
 *
 * The same options {@link GearboxAPI} takes, since both clients read the same
 * backend, minus the chains: those the permissionless backend decides, and
 * {@link ChainsNamespace} reads that list and builds the clients from it.
 **/
export type GearboxPermissionlessOptions = Omit<GearboxAPIOptions, "chainIds">;
