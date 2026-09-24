import type { Address } from "viem";
import { getAddress } from "viem";
import type { ChainId, DataResponse } from "../model/index.js";
import type { OnchainSDK, PluginsMap } from "../onchain/index.js";
import { MultichainConstruct, type MultichainSDK } from "../onchain/index.js";
import { fetchMerklUserRewards } from "./merkl-api.js";
import type { Reward } from "./toMerklRewards.js";
import { toMerklRewards } from "./toMerklRewards.js";
import { toTurtleRewards } from "./toTurtleRewards.js";
import type { TurtleWalletRewards } from "./turtle-api.js";
import { fetchTurtleWalletRewards, turtleStreamAbi } from "./turtle-api.js";

export interface GetRewardsMultichainProps<Plugins extends PluginsMap = {}> {
  sdk: MultichainSDK<Plugins>;
  wallet: Address;
  /** Defaults to every chain the handle carries. */
  chainIds?: ChainId[];
  /** Raises Merkl's rate limit; the keyless path answers too. */
  merklApiKey?: string;
  /** Turtle is skipped without one: its API answers no keyless request. */
  turtleApiKey?: string;
}

class RewardsFanOut<
  const Plugins extends PluginsMap = {},
> extends MultichainConstruct<Plugins> {
  public async list({
    wallet,
    chainIds,
    merklApiKey,
    turtleApiKey,
  }: Omit<GetRewardsMultichainProps<Plugins>, "sdk">): Promise<
    DataResponse<Reward[]>
  > {
    // Merkl keys its answer on the exact string it is given.
    const user = getAddress(wallet);
    // One request for every chain; a failed one fails each chain that awaits it.
    const turtle = turtleApiKey
      ? fetchTurtleWalletRewards(user, turtleApiKey)
      : undefined;
    turtle?.catch(() => {});

    return this.queryChains({
      chainIds,
      label: "list rewards",
      // Neither source has a block of its own: the reported block is the
      // snapshot the pools and tokens were resolved against.
      block: "state",
      run: async (sdk, block) => {
        const sources: Array<Promise<Reward[]>> = [
          fetchMerklUserRewards({
            chainId: sdk.chainId,
            user,
            apiKey: merklApiKey,
          }).then(response => toMerklRewards(sdk, response)),
        ];
        if (turtle) {
          sources.push(
            turtle.then(async rewards =>
              toTurtleRewards(
                sdk,
                rewards,
                await readClaimed(sdk, user, rewards, block.blockNumber),
              ),
            ),
          );
        }
        // A chain fails only when no source answered; a single failed source
        // leaves the rows of the others.
        const settled = await Promise.allSettled(sources);
        const failed = settled.flatMap(r =>
          r.status === "rejected" ? [r.reason] : [],
        );
        if (failed.length === settled.length) {
          throw failed.length === 1
            ? failed[0]
            : new AggregateError(failed, "no rewards source answered");
        }
        for (const reason of failed) {
          (sdk.logger ?? this.sdk.logger)?.warn(
            reason,
            `rewards source failed on chain ${sdk.chainId}`,
          );
        }
        return settled.flatMap(r => (r.status === "fulfilled" ? r.value : []));
      },
    });
  }
}

async function readClaimed(
  sdk: OnchainSDK,
  user: Address,
  { proofs }: TurtleWalletRewards,
  blockNumber: bigint,
): Promise<Map<string, bigint>> {
  const onChain = proofs.filter(p => p.chainId === sdk.chainId);
  if (onChain.length === 0) return new Map();
  const claimed = await sdk.client.multicall({
    contracts: onChain.map(p => ({
      address: p.contractAddress,
      abi: turtleStreamAbi,
      functionName: "getClaimedRewards",
      args: [user],
    })),
    allowFailure: false,
    blockNumber,
  });
  return new Map(onChain.map((p, i) => [p.streamId, claimed[i]]));
}

/**
 * Every claimable reward a wallet holds — Merkl campaigns and the Gearbox
 * organisation's Turtle streams — across the chains the handle carries.
 * A chain is `status: "error"` only when every source failed on it; a chain
 * with nothing to claim is a `"success"` with no rows.
 **/
export async function getRewardsMultichain<
  const Plugins extends PluginsMap = {},
>({
  sdk,
  ...props
}: GetRewardsMultichainProps<Plugins>): Promise<DataResponse<Reward[]>> {
  return new RewardsFanOut(sdk).list(props);
}
