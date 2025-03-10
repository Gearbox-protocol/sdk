import type { Chain, Transport } from "viem";
import { createPublicClient, defineChain, http } from "viem";

import { detectNetwork } from "../utils/viem/index.js";
import { chains } from "./chains.js";

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
    ...chains[networkType],
    id: chainId,
  });
}
