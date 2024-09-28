import { supportedChains, tokenDataByNetwork } from "@gearbox-protocol/sdk-gov";
import type { PublicClient } from "viem";

import { ierc20MetadataAbi } from "../../abi";
import type { NetworkType } from "../../chain";

export async function detectNetwork(
  client: PublicClient,
): Promise<NetworkType> {
  for (const chain of supportedChains) {
    try {
      await client.readContract({
        abi: ierc20MetadataAbi,
        address: tokenDataByNetwork[chain].USDC,
        functionName: "symbol",
      });
      return chain;
    } catch {}
  }

  throw new Error("Unsupported network");
}
