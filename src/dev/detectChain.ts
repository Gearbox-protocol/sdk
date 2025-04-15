import type { Chain, Transport } from "viem";
import { createPublicClient, defineChain, http } from "viem";

import { detectNetwork, getChain } from "../sdk/index.js";

/**
 * Helper to create chain with different chainId (for anvil forks)
 * @param transportOrRPC
 * @returns
 */
export async function detectChain(
  transportOrRPC: Transport | string,
): Promise<Chain> {
  const transport =
    typeof transportOrRPC === "string" ? http(transportOrRPC) : transportOrRPC;
  const tempClient = createPublicClient({ transport });
  const [networkType, chainId] = await Promise.all([
    detectNetwork(tempClient),
    tempClient.getChainId(),
  ]);
  return defineChain({
    ...getChain(networkType),
    id: chainId,
  });
}
