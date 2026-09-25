import type { Address } from "viem";
import { getAddress } from "viem";
import type { ChainId, DataResponse } from "../model/index.js";
import type { PluginsMap } from "../onchain/index.js";
import { MultichainConstruct, type MultichainSDK } from "../onchain/index.js";
import { fetchMerklUserRewards } from "./merkl-api.js";
import { toMerklRewards } from "./toMerklRewards.js";
import { toTurtleRewards } from "./toTurtleRewards.js";
import { fetchTurtleWalletRewards, readTurtleClaimed } from "./turtle-api.js";
import type { Reward } from "./types.js";

interface RewardsServiceKeys {
  /** Raises Merkl's rate limit; the keyless path answers too. */
  merklApiKey?: string;
  /** Turtle is skipped without one: its API answers no keyless request. */
  turtleApiKey?: string;
}

export class RewardsService<
  const Plugins extends PluginsMap = {},
> extends MultichainConstruct<Plugins> {
  readonly #keys: RewardsServiceKeys;

  constructor(sdk: MultichainSDK<Plugins>, keys: RewardsServiceKeys = {}) {
    super(sdk);
    this.#keys = keys;
  }

  /**
   * Every claimable reward a wallet holds — Merkl campaigns and the Gearbox
   * organisation's Turtle streams — across the chains the handle carries.
   * A chain is `status: "error"` only when every source failed on it; a chain
   * with nothing to claim is a `"success"` with no rewards.
   **/
  public async list(
    wallet: Address,
    chainIds?: ChainId[],
  ): Promise<DataResponse<Reward[]>> {
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
