import { formatUnits, getAddress, isAddress } from "viem";
import type { RewardPart } from "./helpers.js";
import {
  mergeRewards,
  parseAmount,
  remaining,
  resolvePool,
  toRewardToken,
} from "./helpers.js";
import type { TurtleWalletRewards, TurtleWalletStream } from "./turtle-api.js";
import type { PointsReward, Reward, RewardsSdk } from "./types.js";

type Targeted = { stream: TurtleWalletStream } & Pick<
  PointsReward,
  "pool" | "poolToken"
>;

/**
 * The streams targeting a pool on the SDK's chain, merged per pool and
 * incentive. A token reward is what is committed and not yet claimed.
 */
export function toTurtleRewards(
  sdk: RewardsSdk,
  { streams, proofs }: TurtleWalletRewards,
  claimed: ReadonlyMap<string, bigint>,
): Reward[] {
  const poolOf = resolvePool(sdk);
  const committed = new Map(proofs.map(p => [p.streamId, p.amount]));

  const targeted = streams.flatMap((stream): Targeted[] => {
    const target = stream.stream.customArgs.targetToken;
    if (Number(target?.chain.chainId) !== sdk.chainId) return [];
    const pool = poolOf(target?.address);
    return pool ? [{ stream, ...pool }] : [];
  });

  const tokens = targeted.flatMap(
    ({ stream, pool, poolToken }): RewardPart[] => {
      const { point, rewardToken, lastSnapshot } = stream.stream;
      if (
        point ||
        !rewardToken ||
        !isAddress(rewardToken.address, { strict: false })
      ) {
        return [];
      }
      const value = remaining(
        parseAmount(committed.get(stream.streamId)),
        claimed.get(stream.streamId),
      );
      if (!value) return [];
      const token = toRewardToken(
        sdk,
        getAddress(rewardToken.address),
        rewardToken,
      );
      const price = lastSnapshot?.rewardTokenPrice;
      return [{ pool, poolToken, token, value, price }];
    },
  );

  return [...mergeRewards(sdk, "turtle", tokens), ...toPoints(sdk, targeted)];
}

/** Points accrue per snapshot; the last one holds the running total. */
function toPoints(
  sdk: RewardsSdk,
  targeted: readonly Targeted[],
): PointsReward[] {
  const merged = new Map<string, PointsReward>();
  for (const { stream, pool, poolToken } of targeted) {
    const { point } = stream.stream;
    const raw = parseAmount(stream.snapshots.at(-1)?.rewardsAccumulated);
    if (!point || !raw) continue;
    const key = `${pool}_${point.id}`;
    const value =
      (merged.get(key)?.points.value ?? 0) +
      Number(formatUnits(raw, point.decimals));
    merged.set(key, {
      source: "turtle",
      chainId: sdk.chainId,
      pool,
      poolToken,
      points: { id: point.id, name: point.name, multiplier: null, value },
    });
  }
  return [...merged.values()];
}
