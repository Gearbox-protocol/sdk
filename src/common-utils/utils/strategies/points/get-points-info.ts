import type { Address } from "viem";

import type {
  LocalPointsInfo,
  PointsList,
  StrategyCreditManagerLike,
} from "../types.js";

export function getPointsInfo({
  chainId,
  pointsList,
  token,
  creditManagers,
}: {
  chainId: number | undefined;
  pointsList: PointsList | undefined;
  token: Address | undefined;
  creditManagers: Record<Address, StrategyCreditManagerLike> | undefined;
}): LocalPointsInfo | undefined {
  if (chainId === undefined || !pointsList || !token) return undefined;

  const info = pointsList[token];

  const r = info
    ? {
        ...info,
        debtRewards: creditManagers
          ? info.debtRewards?.filter(
              r => r.cm === "any" || creditManagers[r.cm],
            )
          : info.debtRewards,
      }
    : info;

  return r;
}
