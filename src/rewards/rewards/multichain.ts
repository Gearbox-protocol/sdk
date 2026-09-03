import type { Address } from "viem";
import { getAddress } from "viem";
import type { ChainId, DataResponse } from "../../model/index.js";
import type { PluginsMap } from "../../onchain/index.js";
import {
  MultichainConstruct,
  type MultichainSDK,
} from "../../onchain/index.js";
import { fetchMerklUserRewards } from "./merkl-api.js";
import type { MerklReward } from "./toMerklRewards.js";
import { toMerklRewards } from "./toMerklRewards.js";

export interface GetMerklRewardsMultichainProps<
  Plugins extends PluginsMap = {},
> {
  /** Handle whose chains are asked. */
  sdk: MultichainSDK<Plugins>;
  /** Wallet whose claimable rewards to list. */
  wallet: Address;
  /**
   * Chains to ask, defaulting to every chain the handle carries.
   **/
  chainIds?: ChainId[];
  /** Raises Merkl's rate limit; the keyless path answers too. */
  apiKey?: string;
}

/**
 * The fan-out itself. Private because rewards are not an SDK namespace yet:
 * the read is a free function, and this is only how it reaches `queryChains`.
 **/
class MerklRewardsFanOut<
  const Plugins extends PluginsMap = {},
> extends MultichainConstruct<Plugins> {
  public async list(
    wallet: Address,
    chainIds: ChainId[] | undefined,
    apiKey: string | undefined,
  ): Promise<DataResponse<MerklReward[]>> {
    // Checksummed once rather than per chain: Merkl keys its answer on the
    // exact string it is given.
    const user = getAddress(wallet);
    return this.queryChains({
      chainIds,
      label: "list rewards",
      // Merkl has no block of its own, so there is nothing to pin and no
      // reason to spend an `eth_getBlockNumber` per chain per poll. The
      // reported block is the loaded snapshot the pools and token names were
      // resolved against — not when Merkl computed the rewards.
      block: "state",
      run: async sdk =>
        toMerklRewards(
          sdk,
          await fetchMerklUserRewards({ chainId: sdk.chainId, user, apiKey }),
        ),
    });
  }
}

/**
 * Every claimable Merkl reward a wallet holds, across the chains the handle
 * carries.
 *
 * Answers the read model's own envelope, so a chain that could not be reached
 * is `status: "error"` in `meta.chains` while a chain with nothing to claim is
 * a `"success"` that contributed no rows. That distinction is the point: the
 * single-chain read this replaces resolved empty either way.
 **/
export async function getMerklRewardsMultichain<
  const Plugins extends PluginsMap = {},
>({
  sdk,
  wallet,
  chainIds,
  apiKey,
}: GetMerklRewardsMultichainProps<Plugins>): Promise<
  DataResponse<MerklReward[]>
> {
  return new MerklRewardsFanOut(sdk).list(wallet, chainIds, apiKey);
}
