import type { Address } from "viem";
import { getAddress } from "viem";

export class AddressMap<T> {
  #map: Map<Address, T>;
  #frozen = false;

  constructor(entries?: Array<[string, T]>) {
    this.#map = new Map<Address, T>();
    if (entries) {
      for (const [address, value] of entries) {
        const key = getAddress(address);
        this.#map.set(key, value);
      }
    }
  }

  /**
   * Adds or updates value
   * @param address
   * @param value
   */
  public upsert(address: string, value: T): void {
    if (this.#frozen) {
      throw new Error(`AddressMap is frozen`);
    }
    const key = getAddress(address);
    this.#map.set(key, value);
  }

  /**
   * Adds value, throws if this address is already used
   * @param address
   * @param value
   */
  public insert(address: string, value: T): void {
    if (this.#frozen) {
      throw new Error(`AddressMap is frozen`);
    }
    const key = getAddress(address);
    if (this.#map.has(key)) {
      throw new Error(`address ${address} already exists`);
    }
    this.#map.set(key, value);
  }

  /**
   * Checks if address is present in map
   * @param address
   * @returns
   */
  public has(address: string): boolean {
    const key = getAddress(address);
    return this.#map.has(key);
  }

  /**
   * Returns value, or undefined if the address is not in map
   * @param address
   * @returns
   */
  public get(address: string): T | undefined {
    const key = getAddress(address);
    return this.#map.get(key);
  }

  /**
   * Gets address from map, throws if not found
   * @param address
   * @returns
   */
  public mustGet(address: string): T {
    const v = this.get(address);
    if (!v) {
      throw new Error(`address ${address} not found in map`);
    }
    return v;
  }

  public clear(): void {
    this.#map.clear();
  }

  public entries(): Array<[Address, T]> {
    return Array.from(this.#map.entries());
  }

  public values(): T[] {
    return Array.from(this.#map.values());
  }

  public keys(): Address[] {
    return Array.from(this.#map.keys());
  }

  public asRecord(): Record<Address, T> {
    return Object.fromEntries(this.#map.entries());
  }

  public freeze(): void {
    this.#frozen = true;
  }
}
