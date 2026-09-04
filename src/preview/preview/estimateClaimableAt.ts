import { type Address, isAddressEqual } from "viem";
import type { Timestamp } from "../../model/index.js";
import type { OnchainSDK, PluginsMap } from "../../onchain/index.js";

/**
 * Estimates when a newly requested delayed withdrawal becomes claimable:
 * `now + withdrawalLength` of the cached withdrawable asset whose phantom
 * token matches `phantomToken`. Same formula as
 * `getWithdrawalRequestResult().claimableAt`.
 *
 * Returns `undefined` when the withdrawal compressor is missing, its assets
 * cache is not loaded, or no asset matches the phantom token.
 */
export function estimateClaimableAt<P extends PluginsMap>(
  sdk: OnchainSDK<P>,
  phantomToken: Address,
): Timestamp | undefined {
  const compressor = sdk.withdrawalCompressor;
  if (!compressor?.state) {
    return undefined;
  }
  const asset = compressor
    .getWithdrawableAssets()
    .find(a => isAddressEqual(a.withdrawalPhantomToken, phantomToken));
  if (!asset) {
    return undefined;
  }
  return Math.floor(Date.now() / 1000) + Number(asset.withdrawalLength);
}
