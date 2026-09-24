import { formatUnits, getAddress, isAddress } from "viem";
import { AddressMap, toBigInt } from "../onchain/index.js";
import { BigIntMath } from "../onchain/utils/bigint-math.js";
import type {
  MerklReward,
  PointsReward,
  Reward,
  RewardsSdk,
} from "./toMerklRewards.js";
import { toRewardToken } from "./toMerklRewards.js";
import type { TurtleWalletRewards } from "./turtle-api.js";

/**
 * Rows for the streams targeting a pool on the SDK's chain, merged per pool
 * and incentive. A token row is what is committed and not yet claimed.
 */
export function toTurtleRewards(
  sdk: RewardsSdk,
  { streams, proofs }: TurtleWalletRewards,
  claimed: ReadonlyMap<string, bigint>,
): Reward[] {
  const pools = AddressMap.fromMappedArray(
    sdk.marketRegister.pools.map(({ pool }) => pool.address),
    address => address,
  );
  const proofByStream = new Map(proofs.map(p => [p.streamId, p]));
  const rows = new Map<string, Reward>();

  for (const { streamId, snapshots, stream } of streams) {
    const target = stream.customArgs.targetToken;
    if (!target || Number(target.chain.chainId) !== sdk.chainId) continue;
    if (!isAddress(target.address, { strict: false })) continue;
    const pool = pools.get(target.address);
    const poolToken = pool && sdk.tokensMeta.getToken(pool);
    if (!pool || !poolToken) continue;
    const base = {
      source: "turtle" as const,
      chainId: sdk.chainId,
      pool,
      poolToken,
    };

    const { point, rewardToken } = stream;
    if (point) {
      const value = parse(snapshots.at(-1)?.rewardsAccumulated);
      if (!value) continue;
      const key = `${pool}_${point.id}`;
      const seen = rows.get(key) as PointsReward | undefined;
      rows.set(key, {
        ...base,
        points: {
          id: point.id,
          name: point.name,
          multiplier: null,
          value:
            (seen?.points.value ?? 0) +
            Number(formatUnits(value, point.decimals)),
        },
      });
      continue;
    }

    if (!rewardToken || !isAddress(rewardToken.address, { strict: false })) {
      continue;
    }
    const committed = parse(proofByStream.get(streamId)?.amount);
    const done = claimed.get(streamId);
    if (committed === undefined || done === undefined) continue;
    const value = BigIntMath.max(committed - done, 0n);
    if (value === 0n) continue;

    const token = toRewardToken(
      sdk,
      getAddress(rewardToken.address),
      rewardToken,
    );
    const key = `${pool}_${token.address}`;
    const seen = rows.get(key) as MerklReward | undefined;
    const total = (seen?.amount.value ?? 0n) + value;
    const price = Number(stream.lastSnapshot?.rewardTokenPrice ?? NaN);
    rows.set(key, {
      ...base,
      amount: {
        token,
        value: total,
        valueUsd: Number.isFinite(price)
          ? Number(formatUnits(total, token.decimals)) * price
          : null,
      },
    });
  }

  return [...rows.values()];
}

function parse(amount: string | undefined): bigint | undefined {
  if (amount === undefined) return undefined;
  try {
    return toBigInt(amount);
  } catch {
    return undefined;
  }
}
