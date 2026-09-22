import type { IPriceFeedContract } from "../types.js";
import type { IUpdatablePriceFeedContract } from "./types.js";

export function isUpdatablePriceFeed(
  pf: IPriceFeedContract,
): pf is IUpdatablePriceFeedContract {
  return pf.updatable;
}
