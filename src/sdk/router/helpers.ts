import type { Address } from "abitype";
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

const TOKEN = "0x19ebd191f7a24ece672ba13a302212b5ef7f35cb".toLowerCase();
const THRESHOLD = 5n * 10n ** 17n;

/**
 * According to van0k, leftover balance for 0x19ebd191f7a24ece672ba13a302212b5ef7f35cb
 * should always be rounded up to 5e17 if amount is less than 5e17
 * Should NEVER be compared with "||" since function will lose it's effect
 */
export function limitLeftover(
  balance: bigint | undefined,
  token: Address,
): bigint | undefined {
  const leftoverBalance = balance ?? 0n;
  if (token.toLowerCase() === TOKEN && leftoverBalance < THRESHOLD) {
    return THRESHOLD;
  }
  return balance;
}
