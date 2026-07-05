import type { Address } from "viem";
import { getAddress } from "viem";

/**
 * Case-insensitive map keyed by EVM addresses.
 *
 * All keys are checksummed via viem's {@link getAddress} on insertion and
 * lookup, so `0xabc...` and `0xABC...` resolve to the same entry.
 *
 * @typeParam T - Type of values stored in the map.
 */
export class AddressMap<T> {
  #map: Map<Address, T>;
  #frozen = false;
  #name?: string;

  /**
   * @param entries - Optional initial key-value pairs. Address strings are checksummed automatically.
   * @param name - Optional label used in error messages when a lookup fails.
   */
  constructor(entries?: Array<[string, T]>, name?: string) {
    this.#map = new Map<Address, T>();
    if (entries) {
      for (const [address, value] of entries) {
        const key = getAddress(address);
        this.#map.set(key, value);
      }
    }
    this.#name = name;
  }

  /**
   * Adds or updates a value. Passing `undefined` removes the entry.
   * @param address - EVM address (checksummed automatically).
   * @param value - Value to store, or `undefined` to delete the entry.
   * @throws If the map has been {@link freeze | frozen}.
   */
  public upsert(address: string, value: T | undefined): void {
    if (this.#frozen) {
      throw new Error(`AddressMap ${this.#name} is frozen`);
    }
    const key = getAddress(address);
    if (value === undefined) {
      this.#map.delete(key);
    } else {
      this.#map.set(key, value);
    }
  }

  /**
   * Inserts a value, throwing if the address is already present.
   * @param address - EVM address (checksummed automatically).
   * @param value - Value to store.
   * @throws If the map has been {@link freeze | frozen} or if `address` already exists.
   */
  public insert(address: string, value: T): void {
    if (this.#frozen) {
      throw new Error(`AddressMap ${this.#name} is frozen`);
    }
    const key = getAddress(address);
    if (this.#map.has(key)) {
      throw new Error(
        `address ${address} already exists in ${this.#name ?? "map"}`,
      );
    }
    this.#map.set(key, value);
  }

  /**
   * Checks whether an address is present in the map.
   * @param address - EVM address (case-insensitive).
   */
  public has(address: string): boolean {
    const key = getAddress(address);
    return this.#map.has(key);
  }

  /**
   * Looks up a value by EVM address (case-insensitive).
   * @param address - EVM address to look up.
   * @returns The stored value, or `undefined` if not present.
   */
  public get(address: string): T | undefined {
    const key = getAddress(address);
    return this.#map.get(key);
  }

  /**
   * Looks up a value by EVM address, throwing if the address is absent.
   * @param address - EVM address to look up.
   * @throws If `address` is not in the map.
   */
  public mustGet(address: string): T {
    const key = getAddress(address);
    if (!this.#map.has(key)) {
      throw new Error(`address ${address} not found in ${this.#name ?? "map"}`);
    }
    return this.#map.get(key)!;
  }

  /**
   * Removes an entry by address. No-op if the address is absent.
   * @param address - EVM address to remove.
   */
  public delete(address: string): void {
    const key = getAddress(address);
    this.#map.delete(key);
  }

  /**
   * Removes all entries from the map.
   **/
  public clear(): void {
    this.#map.clear();
  }

  /**
   * Returns all entries as an array of `[checksummedAddress, value]` tuples.
   **/
  public entries(): Array<[Address, T]> {
    return Array.from(this.#map.entries());
  }

  /**
   * Returns all values in insertion order.
   **/
  public values(): T[] {
    return Array.from(this.#map.values());
  }

  /**
   * Returns all checksummed addresses in insertion order.
   **/
  public keys(): Address[] {
    return Array.from(this.#map.keys());
  }

  /**
   * Returns an unfrozen shallow copy of the map.
   **/
  public clone(): AddressMap<T> {
    return new AddressMap(this.entries(), this.name);
  }

  /**
   * Converts the map to a plain `Record<Address, T>` object.
   **/
  public asRecord(): Record<Address, T> {
    return Object.fromEntries(this.#map.entries());
  }

  /**
   * Number of entries in the map.
   **/
  public get size(): number {
    return this.#map.size;
  }

  /**
   * Prevents further mutations. Any subsequent call to {@link upsert},
   * {@link insert}, or {@link delete} will throw.
   */
  public freeze(): void {
    this.#frozen = true;
  }

  protected get name(): string | undefined {
    return this.#name;
  }

  /**
   * Creates an `AddressMap` from a plain record object.
   * @param record - Object whose keys are EVM addresses.
   */
  public static fromRecord<T>(record: Record<Address, T>): AddressMap<T> {
    return new AddressMap(Object.entries(record));
  }

  /**
   * Creates an `AddressMap` by extracting an address from each array element.
   * @param array - Source items.
   * @param mapFn - Function that returns the address key for a given item.
   */
  public static fromMappedArray<T>(
    array: T[],
    mapFn: (item: T) => Address,
  ): AddressMap<T> {
    return new AddressMap(array.map(item => [mapFn(item), item]));
  }
}
