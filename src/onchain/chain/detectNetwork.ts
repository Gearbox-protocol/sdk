import type { PublicClient } from "viem";
import { ierc20Abi } from "../../abi/iERC20.js";
import type { NetworkType } from "./chains.js";
import { chains } from "./chains.js";

/**
 * Detects the network type from the given client.
 * See {@link GearboxChain.wellKnownToken} for more details.
 * @param client - viem public client
 * @returns Network type
 * @throws {Error} If the network type is not supported
 */
export async function detectNetwork(
  client: PublicClient,
): Promise<NetworkType> {
  for (const chain of Object.values(chains)) {
    try {
      const symbol = await client.readContract({
        abi: ierc20Abi,
        address: chain.wellKnownToken.address,
        functionName: "symbol",
      });
      if (symbol === chain.wellKnownToken.symbol) {
        return chain.network;
      }
    } catch {}
  }

  throw new Error("Unsupported network");
}
