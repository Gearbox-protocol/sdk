import type { PublicClient } from "viem";

import { ierc20MetadataAbi } from "../../abi";
import { type NetworkType, SUPPORTED_CHAINS } from "../../chain";
import { USDC } from "../../constants";

export async function detectNetwork(
  client: PublicClient,
): Promise<NetworkType> {
  for (const chain of SUPPORTED_CHAINS) {
    try {
      await client.readContract({
        abi: ierc20MetadataAbi,
        address: USDC[chain],
        functionName: "symbol",
      });
      return chain;
    } catch {}
  }

  throw new Error("Unsupported network");
}
