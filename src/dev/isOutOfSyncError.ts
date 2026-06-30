import { BaseError } from "viem";

// Each pattern corresponds to a specific provider/chain error message
// for "block not found" responses:
const OUT_OF_SYNC_PATTERNS: RegExp[] = [
  // Alchemy (code 3), DRPC (code 26), Thirdweb (code 26) on Mainnet/Plasma/Monad
  /unknown block/i,
  // Ankr (code -32000) on Mainnet
  /header not found/i,
  // Alchemy, Ankr, Thirdweb, direct Monad RPCs (code -32602)
  /block requested not found/i,
  // Ankr, Thirdweb, direct Somnia RPCs (code -1)
  /unable to load historical state/i,
  // Ankr, Thirdweb, direct Etherlink RPCs (code -32603)
  /no state available for block/i,
  // Generic "block not found" (code -32001) from various providers
  /block\b.*\bnot found/i,
  // Optimism proxyd (code -32019) for future/non-existent blocks
  /block is out of range/i,
  // EIP-1474 standard (code -32001) when block/state is not available
  /resource not found/i,
  // DRPC when a requested block is ahead of the node's latest block
  /greater than latest block/i,
];

/**
 * Whether the error indicates an out-of-sync / missing block (e.g. pinned block not yet available on the node).
 */
export function isOutOfSyncError(e: Error): boolean {
  if (e instanceof BaseError) {
    const match = e.walk(err => {
      const msg =
        (err as { details?: string }).details ?? (err as Error).message ?? "";
      return OUT_OF_SYNC_PATTERNS.some(re => re.test(msg));
    });
    return match !== null;
  }
  return OUT_OF_SYNC_PATTERNS.some(re => re.test(e.message));
}
