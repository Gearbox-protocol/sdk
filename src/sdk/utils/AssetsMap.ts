import type { Address } from "viem";

import type { Asset } from "../base/types.js";
import { AddressMap } from "./AddressMap.js";

/**
 * Case-insensitive map from EVM token addresses to bigint balances.
 * Missing keys are treated as `0n`.
 */
export class AssetsMap extends AddressMap<bigint> {
  /**
   * @param entries - Optional initial entries as `[address, balance]` tuples or {@link Asset} objects.
   * @param name - Optional label used in error messages when a lookup fails.
   */
  constructor(entries?: Array<[string, bigint] | Asset>, name?: string) {
    super(
      entries?.map(e => (Array.isArray(e) ? e : [e.token, e.balance])),
      name,
    );
  }

  /**
   * Looks up a token balance, treating a missing key as `0n`.
   */
  public getOrZero(address: string): bigint {
    return this.get(address) ?? 0n;
  }

  /**
   * Adds `amount` to the token balance, treating a missing key as `0n`.
   */
  public inc(address: string, amount: bigint): void {
    this.upsert(address, this.getOrZero(address) + amount);
  }

  /**
   * Subtracts `amount` from the token balance, treating a missing key as `0n`.
   */
  public dec(address: string, amount: bigint): void {
    this.inc(address, -amount);
  }

  /**
   * Per-token difference `this - before`, non-zero entries only.
   *
   * Assumes this map's keys are a superset of `before`'s keys; tokens present
   * only in `before` are not reported.
   */
  public difference(before: AssetsMap): AssetsMap {
    const result = new AssetsMap();
    for (const [token, balance] of this.entries()) {
      const change = balance - before.getOrZero(token);
      if (change !== 0n) {
        result.upsert(token, change);
      }
    }
    return result;
  }

  /**
   * Sums `fn` over all entries.
   */
  public sum(fn: (token: Address, balance: bigint) => bigint): bigint {
    return this.entries().reduce(
      (acc, [token, balance]) => acc + fn(token, balance),
      0n,
    );
  }

  /**
   * Converts the map to an array of {@link Asset} objects.
   * @param minBalance - If provided, keeps only entries with a balance
   * strictly greater than this threshold (e.g. `1n` to filter out dust).
   */
  public toAssets(minBalance?: bigint): Asset[] {
    return this.entries()
      .filter(([, balance]) => minBalance === undefined || balance > minBalance)
      .map(([token, balance]) => ({ token, balance }));
  }

  public override clone(): AssetsMap {
    return new AssetsMap(this.entries(), this.name);
  }
}
