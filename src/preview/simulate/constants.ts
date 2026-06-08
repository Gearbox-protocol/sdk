import type { NetworkType } from "../../sdk/chain/index.js";

/**
 * Networks where the `eth_simulateV1` JSON-RPC method is available and usable
 * for pool or credit account operation simulation.
 **/
export const ETH_SIMULATE_V1_NETWORKS: ReadonlySet<NetworkType> =
  new Set<NetworkType>(["Mainnet", "Plasma", "Somnia"]);
