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
   * Adds `amount` to the token balance, treating a missing key as `0n`.
   */
  public inc(address: string, amount: bigint): void {
    this.upsert(address, (this.get(address) ?? 0n) + amount);
  }

  /**
   * Subtracts `amount` from the token balance, treating a missing key as `0n`.
   */
  public dec(address: string, amount: bigint): void {
    this.inc(address, -amount);
  }

  /**
   * Converts the map to an array of {@link Asset} objects.
   */
  public toAssets(): Asset[] {
    return this.entries().map(([token, balance]) => ({ token, balance }));
  }

  public override clone(): AssetsMap {
    return new AssetsMap(this.entries(), this.name);
  }
}
