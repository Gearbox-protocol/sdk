import { LEVERAGE_DECIMALS } from "../../../../sdk/constants/math.js";

import type { LocalPointsReward } from "../types.js";

export function getPointsRates(
  rewards: Array<Pick<LocalPointsReward, "multiplier">>,
  leverage: bigint,
) {
  return rewards.map(r =>
    r.multiplier === "soon"
      ? r.multiplier
      : (leverage * r.multiplier) / LEVERAGE_DECIMALS,
  );
}
