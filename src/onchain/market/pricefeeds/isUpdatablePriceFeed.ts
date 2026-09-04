import type {
  IPriceFeedContract,
  IUpdatablePriceFeedContract,
} from "./types.js";

export function isUpdatablePriceFeed(
  pf: IPriceFeedContract,
): pf is IUpdatablePriceFeedContract {
  return pf.updatable;
}
