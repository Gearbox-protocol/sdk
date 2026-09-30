import type { Address } from "viem";
import { getAddress } from "viem";
import type { ChainId, DataResponse, Reward } from "../../model/index.js";
import {
  MultichainConstruct,
  type MultichainSDK,
} from "../../onchain/index.js";
import type { EnsureFreshChains, NamespaceOptions } from "../types.js";
import { fetchMerklUserRewards } from "./merkl-api.js";
import { toMerklRewards } from "./toMerklRewards.js";
import { toTurtleRewards } from "./toTurtleRewards.js";
import { fetchTurtleWalletRewards, readTurtleClaimed } from "./turtle-api.js";
import type { IRewards, RewardsKeys } from "./types.js";

/**
 * {@inheritDoc IRewards}
 **/
export class RewardsNamespace extends MultichainConstruct implements IRewards {
  readonly #keys: RewardsKeys;
  readonly #ensureFresh?: EnsureFreshChains;

  constructor(
    onchain: MultichainSDK,
    keys: RewardsKeys | undefined,
    options: NamespaceOptions,
  ) {
    super(onchain);
    this.#keys = keys ?? {};
    this.#ensureFresh = options.ensureFresh;
  }

  /**
   * {@inheritDoc IRewards.list}
   **/
  public async list(
    wallet: Address,
    chainIds?: ChainId[],
  ): Promise<DataResponse<Reward[]>> {
    await this.#ensureFresh?.(chainIds);
    const { merklApiKey, turtleApiKey } = this.#keys;
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
      // Turtle's claimed amounts are read at latest, so a stream claimed a
      // moment ago is gone.
      run: async sdk => {
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
                await readTurtleClaimed(sdk, user, rewards),
              ),
            ),
          );
        }
        // A chain fails only when no source answered; a single failed source
        // leaves the rewards of the others.
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
