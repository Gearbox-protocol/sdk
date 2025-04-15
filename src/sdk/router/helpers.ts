import { AddressMap } from "../utils/index.js";
import type { Asset, RouterResult } from "./types.js";

export function balancesMap(assets: Array<Asset>): AddressMap<bigint> {
  return new AddressMap(assets.map(({ token, balance }) => [token, balance]));
}

export function compareRouterResults(
  a: RouterResult,
  b: RouterResult,
): RouterResult {
  return a.amount > b.amount ? a : b;
}

export function assetsMap<T extends Asset>(
  assets: Array<T> | readonly T[],
): AddressMap<T> {
  return new AddressMap(assets.map(a => [a.token, a]));
}
