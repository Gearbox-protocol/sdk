import { getAddress, isAddress } from "viem";
import type { RewardPart } from "./helpers.js";
import {
  mergeRewards,
  parseAmount,
  remaining,
  resolvePool,
  toRewardToken,
} from "./helpers.js";
import type { MerkleXYZUserRewardsV4Response } from "./merkl-api.js";
import type { MerklReward, RewardsSdk } from "./types.js";

/**
 * Merkl's answer for one chain, one reward per pool and incentive token.
 * A breakdown Merkl cannot be read from is skipped rather than thrown on: it
 * must not sink the chain, which the caller would then be told is unreachable.
 */
export function toMerklRewards(
  sdk: RewardsSdk,
  response: MerkleXYZUserRewardsV4Response,
): MerklReward[] {
  const poolOf = resolvePool(sdk);

  const parts = response
    .flatMap(({ rewards }) => rewards)
    .flatMap(({ token, breakdowns }): RewardPart[] => {
      if (!isAddress(token.address, { strict: false })) return [];
      const rewardToken = toRewardToken(sdk, getAddress(token.address), token);

      return breakdowns.flatMap(({ reason, amount, claimed }) => {
        // The campaign names the pool inside its reason, e.g. `ERC20_0x…`.
        const pool = poolOf(reason?.split("_").find(p => p.startsWith("0x")));
        const value = remaining(parseAmount(amount), parseAmount(claimed));
        if (!pool || !value) return [];
        return [{ ...pool, token: rewardToken, value, price: token.price }];
      });
    });

  return mergeRewards(sdk, "merkl", parts);
}
